// Looking at a single unit...

//// Constants /////////////////////////////////////////////////////////////////

const INIT_GUESS = 0.3
const INIT_SLIP = 0.1
const INIT_LEARNED = 0.5
const MAX_LEARNED = 0.99
const INIT_TRANSIT = 0.05 // TODO update to estimate, 0.05?

//// Formulas //////////////////////////////////////////////////////////////////

function calcCorrect(guess, slip, learned) {
  return learned * (1 - slip) + (1 - learned) * guess
}

function calcIncorrect(guess, slip, learned) {
  return learned * slip + (1 - learned) * (1 - guess)
}

function updateLearned({ score, learned, guess, slip, transit }) {
  const posterior =
    (score * calcCorrect(0, slip, learned)) /
      calcCorrect(guess, slip, learned) +
    ((1 - score) * calcIncorrect(0, slip, learned)) /
      calcIncorrect(guess, slip, learned)
  return posterior + (1 - posterior) * transit
}

function sum(arr) {
  return arr.reduce((sum, val) => sum + val, 0)
}

function mean(arr) {
  return sum(arr) / arr.length
}

function error(arr1, arr2) {
  return mean(
    [...Array(arr1.length).keys()].map(i => Math.abs(arr1[i] - arr2[i]))
  )
}

function correlation(arr1, arr2) {
  const sum1 = sum(arr1)
  const sum2 = sum(arr2)
  return error(arr1.map(a => a / sum1), arr2.map(a => a / sum2))
}

function around(value) {
  return value + Math.random() * value - 0.5 * value
}

function choose(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function smoothed(init, sum, count, C = 30) {
  return (C * init + sum) / (C + count)
}

//// Mock //////////////////////////////////////////////////////////////////////

function createCards(numCards = 20) {
  return [...Array(numCards).keys()].map(i => ({
    name: i,
    realGuess: around(INIT_GUESS),
    guess: INIT_GUESS,
    realSlip: around(INIT_SLIP),
    slip: INIT_SLIP,
    realTransit: INIT_TRANSIT, // TODO around(INIT_TRANSIT)
    transit: INIT_TRANSIT,
    responses: [],
  }))
}

function createLearners(numLearners = 1000) {
  return [...Array(numLearners).keys()].map(i => ({
    name: i,
    learned: INIT_LEARNED,
  }))
}

//// Simluate //////////////////////////////////////////////////////////////////

function getScore(learner, card) {
  const correct = calcCorrect(card.realGuess, card.realSlip, learner.learned)
  return +(correct > Math.random())
}

function updateLearner(learner, params) {
  learner.learned = updateLearned(params)
}

function updateCard(card, params) {
  // THIS IS WHERE THE EXPERIMENT OCCURS!!!
  // card.guess = ???
  // card.slip = ???
  // card.transit = ???

  // guess ... 1 - learned
  // slip ... learned

  // median response learned is ~ 0.67
  // 0.5 ** 0.57 ~= 0.67

  card.guess = smoothed(
    INIT_GUESS,
    sum(
      card.responses.map(
        ({ score, learned }) => score * (1 - learned ** 0.57) * 0.46
      )
    ),
    sum(card.responses.map(({ score, learned }) => 1 - learned ** 0.57))
  )

  card.slip = smoothed(
    INIT_SLIP,
    sum(
      card.responses.map(
        ({ score, learned }) => (1 - score) * learned ** 0.57 * 0.44
      )
    ),
    sum(card.responses.map(({ score, learned }) => learned ** 0.57))
  )

  if (card.guess + card.slip > 0.7) {
    card.guess = INIT_GUESS
    card.slip = INIT_SLIP
  }
}

function updateCard2(card, params) {
  // THIS IS WHERE THE EXPERIMENT OCCURS!!!
  // card.guess = ???
  // card.slip = ???
  // card.transit = ???

  // guess ... 1 - learned
  // slip ... learned

  // median response learned is ~ 0.67
  // 0.5 ** 0.57 ~= 0.67

  card.guess = smoothed(
    INIT_GUESS,
    sum(
      card.responses.map(
        ({ score, learned, slip }) =>
          (1 - learned) *
          (score === 1
            ? (1 - learned * (1 - slip)) / (1 - learned)
            : (-1 * (learned - learned * slip)) / (1 - learned))
      )
    ),
    sum(card.responses.map(({ score, learned }) => 1 - learned))
  )

  card.slip = smoothed(
    INIT_SLIP,
    sum(
      card.responses.map(
        ({ score, learned, guess }) =>
          learned *
          (score === 1
            ? (-1 * (1 - guess * (1 - learned) - learned)) / learned
            : (learned - learned * guess + guess) / learned)
      )
    ),
    sum(card.responses.map(({ score, learned }) => learned))
  )

  if (card.guess + card.slip > 0.7) {
    card.guess = INIT_GUESS
    card.slip = INIT_SLIP
  }
}

function simulate(numCards, numLearners, rounds = 5000) {
  const cards = createCards(numCards)
  const learners = createLearners(numLearners)

  for (let i = 0; i < rounds; i++) {
    const learner = choose(learners)
    if (learner.learned > MAX_LEARNED) continue
    const card = choose(cards)
    const score = getScore(learner, card)
    const params = {
      score,
      learned: learner.learned,
      guess: card.guess,
      slip: card.slip,
      transit: card.transit,
    }
    card.responses.push(params)
    updateLearner(learner, params)
    updateCard2(card, params)
  }

  return { cards, learners }
}

//// Result ////////////////////////////////////////////////////////////////////

function results(cards, learners) {
  const meanResponses = mean(cards.map(({ responses }) => responses.length))
  const meanGuess = mean(cards.map(({ guess }) => guess))
  const guessPerf =
    error(
      cards.map(({ guess }) => guess),
      cards.map(({ realGuess }) => realGuess)
    ) /
    error(cards.map(({ realGuess }) => realGuess), cards.map(() => INIT_GUESS))
  const guessCorr =
    correlation(
      cards.map(({ guess }) => guess),
      cards.map(({ realGuess }) => realGuess)
    ) /
    correlation(
      cards.map(({ realGuess }) => realGuess),
      cards.map(() => INIT_GUESS)
    )
  const meanSlip = mean(cards.map(({ slip }) => slip))
  const slipPerf =
    error(
      cards.map(({ slip }) => slip),
      cards.map(({ realSlip }) => realSlip)
    ) /
    error(cards.map(({ realSlip }) => realSlip), cards.map(() => INIT_SLIP))
  const slipCorr =
    correlation(
      cards.map(({ slip }) => slip),
      cards.map(({ realSlip }) => realSlip)
    ) /
    correlation(
      cards.map(({ realSlip }) => realSlip),
      cards.map(() => INIT_SLIP)
    )
  return {
    meanResponses,
    meanGuess,
    guessPerf,
    guessCorr,
    meanSlip,
    slipPerf,
    slipCorr,
  }
}

//// Run ///////////////////////////////////////////////////////////////////////

if (require.main === module) {
  // The goal is to beat `1`.
  const { cards, learners } = simulate(100, 4000, 20000)
  console.log(results(cards, learners))
}

/*
  () => INIT_GUESS,
  () => INIT_SLIP,
  () => INIT_TRANSIT,
  () => 0,
  () => 1,
  ({ learned }) => learned,
  ({ learned }) => 1 - learned,
  ({ learned }) => 1 + learned,
  ({ learned }) => 1 / learned,
  ({ learned }) => 1 / (1 - learned),
  ({ learned }) => 1 / (1 + learned),
  ({ learned }) => learned / (1 - learned),
  ({ learned }) => learned / (1 + learned),
  ({ learned }) => (1 - learned) / learned,
  ({ learned }) => (1 - learned) / (1 + learned),
  ({ learned }) => (1 + learned) / learned,
  ({ learned }) => (1 + learned) / (1 - learned),
  ({ learned, guess, slip }) => calcCorrect(guess, slip, learned),
  ({ learned, guess, slip }) => calcIncorrect(guess, slip, learned),
  ({ learned, guess, slip }) => calcCorrect(0, slip, learned),
  ({ learned, guess, slip }) => calcIncorrect(0, slip, learned),
  ({ learned, guess, slip }) => calcCorrect(1, slip, learned),
  ({ learned, guess, slip }) => calcIncorrect(1, slip, learned),
  ({ learned, guess, slip }) => calcCorrect(guess, 0, learned),
  ({ learned, guess, slip }) => calcIncorrect(guess, 0, learned),
  ({ learned, guess, slip }) => calcCorrect(guess, 1, learned),
  ({ learned, guess, slip }) => calcIncorrect(guess, 1, learned),
  ({ learned, guess, slip }) => calcCorrect(guess, slip, 0),
  ({ learned, guess, slip }) => calcIncorrect(guess, slip, 0),
  ({ learned, guess, slip }) => calcCorrect(guess, slip, 1),
  ({ learned, guess, slip }) => calcIncorrect(guess, slip, 1),
  ({ learned, guess, slip }) => calcCorrect(0, 0, learned),
  ({ learned, guess, slip }) => calcIncorrect(0, 0, learned),
  ({ learned, guess, slip }) => calcCorrect(1, 1, learned),
  ({ learned, guess, slip }) => calcIncorrect(1, 1, learned),
  ({ learned, guess, slip }) => calcCorrect(0, 1, learned),
  ({ learned, guess, slip }) => calcIncorrect(0, 1, learned),
  ({ learned, guess, slip }) => calcCorrect(1, 0, learned),
  ({ learned, guess, slip }) => calcIncorrect(1, 0, learned),
  ({ learned, guess, slip }) => calcCorrect(0, slip, 0),
  ({ learned, guess, slip }) => calcIncorrect(0, slip, 0),
  ({ learned, guess, slip }) => calcCorrect(1, slip, 1),
  ({ learned, guess, slip }) => calcIncorrect(1, slip, 1),
  ({ learned, guess, slip }) => calcCorrect(0, slip, 1),
  ({ learned, guess, slip }) => calcIncorrect(0, slip, 1),
  ({ learned, guess, slip }) => calcCorrect(1, slip, 0),
  ({ learned, guess, slip }) => calcIncorrect(1, slip, 0),
  ({ learned, guess, slip }) => calcCorrect(guess, 0, 0),
  ({ learned, guess, slip }) => calcIncorrect(guess, 0, 0),
  ({ learned, guess, slip }) => calcCorrect(guess, 1, 1),
  ({ learned, guess, slip }) => calcIncorrect(guess, 1, 1),
  ({ learned, guess, slip }) => calcCorrect(guess, 1, 0),
  ({ learned, guess, slip }) => calcIncorrect(guess, 1, 0),
  ({ learned, guess, slip }) => calcCorrect(guess, 0, 1),
  ({ learned, guess, slip }) => calcIncorrect(guess, 0, 1),





  const totalOptions = values.length ** 6
  let option = 0

  const opt1 = []
  const opt2 = []
  const opt3 = []

  for (let a = 0; a < values.length; a++) {
    for (let b = 0; b < values.length; b++) {
      for (let c = 0; c < values.length; c++) {
        for (let d = 0; d < values.length; d++) {
          for (let e = 0; e < values.length; e++) {
            for (let f = 0; f < values.length; f++) {


  const path = [f, e, d, c, b, a]
  const { cards, learners } = simulate(20000, path)


  const foundCount = (guessPerf < 0.99) + (slipPerf < 0.99) + (transitPerf < 0.99)
  if (foundCount > 0) {
    const data = { path, guessPerf, slipPerf, transitPerf }
    if (foundCount === 1) opt1.push(data)
    if (foundCount === 2) opt2.push(data)
    if (foundCount === 3) opt3.push(data)
  }

  option++

  process.stdout.clearLine()
  process.stdout.cursorTo(0)
  process.stdout.write(`${option} of ${totalOptions}, found ${opt1.length} ${opt2.length} ${opt3.length} ... ${path.map(p => (''+p).padStart(2)).join(' ')}`)



            }
          }
        }
      }
    }
  }

*/
