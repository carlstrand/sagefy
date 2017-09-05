import rethinkdb as r
import psycopg2
from modules.util import convert_slug_to_uuid
from database.util import save_row
from framework.database import make_db_connection
from framework.elasticsearch import es
from framework.redis import redis
from es_populate import es_populate
import yaml
import os
import psycopg2.extras
from modules.sequencer.params import precision
from datetime import datetime, timezone
import uuid
from modules.util import convert_uuid_to_slug

dirname = os.path.realpath(__file__).replace('/server/dev_data.py', '')

stream = open(
    '%s/server/intro_electronic_music_example_collection.yaml' % (dirname,),
    'r'
)
sample_data = yaml.load(stream)
stream.close()

psycopg2.extras.register_uuid()

r_db_conn = r.connect(
    host='localhost',
    port=28015,
    db='sagefy',
    timeout=60,
)
pg_db_conn = make_db_connection()

es.indices.delete(index='entity', ignore=[400, 404])

redis.flushall()

founder_id = convert_slug_to_uuid('NNKkHsjE3pEOW0wsPaQJm9MD')

users = r.table('users').run(r_db_conn)

for user in users:
    query = """
        INSERT INTO users
        (id, created, modified, name, email, password, settings)
        VALUES
        (%(id)s, %(created)s, %(modified)s, %(name)s,
         %(email)s, %(password)s, %(settings)s);
    """
    params = {
        'id': convert_slug_to_uuid(user['id']),
        'created': user['created'],
        'modified': user['modified'],
        'name': user['name'],
        'email': user['email'],
        'password': user['password'],
        'settings': psycopg2.extras.Json(user['settings']),
    }
    save_row(pg_db_conn, query, params)


# We have to translate the sample IDs to UUIDs
entity_ids_lookup = {}

for sample_id, unit_data in sample_data['units'].items():
    unit_data['version_id'] = uuid.uuid4()
    if sample_id in entity_ids_lookup:
        unit_data['entity_id'] = entity_ids_lookup[sample_id]
    else:
        unit_data['entity_id'] = entity_ids_lookup[sample_id] = uuid.uuid4()

    u_require_ids = []
    for id_ in unit_data['require_ids']:
        if id_ not in entity_ids_lookup:
            entity_ids_lookup[id_] = uuid.uuid4()
        u_require_ids.append(entity_ids_lookup[id_])
    unit_data['require_ids'] = u_require_ids

    # Dropping foreign key checks so the ordering doesn't matter.
    query = """
        BEGIN;
        ALTER TABLE units DISABLE TRIGGER ALL;
        INSERT INTO units_entity_id
        (  entity_id  )
        VALUES
        (%(entity_id)s);
        INSERT INTO units
        (  version_id  ,   created  ,   modified  ,
           entity_id  ,   previous_id  ,   language  ,   status  ,
           available  ,   tags  ,   name  ,   user_id  ,
           body  ,   require_ids  )
        VALUES
        (%(version_id)s, %(created)s, %(modified)s,
         %(entity_id)s, %(previous_id)s, %(language)s, %(status)s,
         %(available)s, %(tags)s, %(name)s, %(user_id)s,
         %(body)s, %(require_ids)s);
        ALTER TABLE units ENABLE TRIGGER ALL;
        COMMIT;
    """
    params = {
        'version_id': unit_data['version_id'],
        'created': datetime(2014, 1, 1, tzinfo=timezone.utc),
        'modified': datetime(2014, 1, 1, tzinfo=timezone.utc),
        'entity_id': unit_data['entity_id'],
        'previous_id': None,
        'language': 'en',
        'status': 'accepted',
        'available': True,
        'tags': [],
        'name': unit_data['name'],
        'user_id': founder_id,
        'body': unit_data['body'],
        'require_ids': unit_data['require_ids'],
    }
    save_row(pg_db_conn, query, params)


for card_data in sample_data['cards']['video']:
    card_data['entity_id'] = uuid.uuid4()
    query = """
        INSERT INTO cards_entity_id
        (  entity_id  )
        VALUES
        (%(entity_id)s);
        INSERT INTO cards
        (  version_id  ,   created  ,   modified  ,
           entity_id  ,   previous_id  ,   language  ,   status  ,
           available  ,   tags  ,   name  ,   user_id  ,
           unit_id  ,   require_ids  ,   kind  ,   data  )
        VALUES
        (%(version_id)s, %(created)s, %(modified)s,
         %(entity_id)s, %(previous_id)s, %(language)s, %(status)s,
         %(available)s, %(tags)s, %(name)s, %(user_id)s,
         %(unit_id)s, %(require_ids)s, %(kind)s, %(data)s);
    """
    params = {
        'version_id': uuid.uuid4(),
        'created': datetime(2014, 1, 1, tzinfo=timezone.utc),
        'modified': datetime(2014, 1, 1, tzinfo=timezone.utc),
        'entity_id': card_data['entity_id'],
        'previous_id': None,
        'language': 'en',
        'name': 'A Video',
        'status': 'accepted',
        'available': True,
        'tags': [],
        'user_id': founder_id,
        'kind': 'video',
        'data': psycopg2.extras.Json({
            'site': 'youtube',
            'video_id': card_data['video_id'],
        }),
        'unit_id': entity_ids_lookup[card_data['unit']],
        'require_ids': [],
    }
    save_row(pg_db_conn, query, params)


for card_data in sample_data['cards']['choice']:
    card_data['entity_id'] = uuid.uuid4()
    query = """
        INSERT INTO cards_entity_id
        (  entity_id  )
        VALUES
        (%(entity_id)s);
        INSERT INTO cards
        (  version_id  ,   created  ,   modified  ,
           entity_id  ,   previous_id  ,   language  ,   status  ,
           available  ,   tags  ,   name  ,   user_id  ,
           unit_id  ,   require_ids  ,   kind  ,   data  )
        VALUES
        (%(version_id)s, %(created)s, %(modified)s,
         %(entity_id)s, %(previous_id)s, %(language)s, %(status)s,
         %(available)s, %(tags)s, %(name)s, %(user_id)s,
         %(unit_id)s, %(require_ids)s, %(kind)s, %(data)s);
        INSERT INTO cards_parameters
        (  id  ,   created  ,   modified,
          entity_id  ,   guess_distribution  ,   slip_distribution  )
        VALUES
        (%(id)s, %(created)s, %(modified)s,
         %(entity_id)s, %(guess_distribution)s, %(slip_distribution)s);
    """
    params = {
        'id': uuid.uuid4(),
        'version_id': uuid.uuid4(),
        'created': datetime(2014, 1, 1, tzinfo=timezone.utc),
        'modified': datetime(2014, 1, 1, tzinfo=timezone.utc),
        'entity_id': card_data['entity_id'],
        'previous_id': None,
        'language': 'en',
        'name': card_data['body'],
        'status': 'accepted',
        'available': True,
        'tags': [],
        'user_id': founder_id,
        'kind': 'choice',
        'data': psycopg2.extras.Json({
            'body': card_data['body'],
            'options': [
                {
                    'id': convert_uuid_to_slug(uuid.uuid4()),
                    'correct': opt['correct'] == 'Y',
                    'value': opt['value'],
                    'feedback': opt['feedback'],
                } for opt in card_data['options']
            ],
            'order': 'random',
            'max_options_to_show': 4,
        }),
        'unit_id': entity_ids_lookup[card_data['unit']],
        'require_ids': [],
        'guess_distribution': psycopg2.extras.Json({
            str(h): 1 - (0.5 - h) ** 2
            for h in [h / precision for h in range(1, precision)]
        }),
        'slip_distribution': psycopg2.extras.Json({
            str(h): 1 - (0.25 - h) ** 2
            for h in [h / precision for h in range(1, precision)]
        }),
    }
    save_row(pg_db_conn, query, params)


for sample_id, subject_data in sample_data['subjects'].items():
    if sample_id in entity_ids_lookup:
        subject_data['entity_id'] = entity_ids_lookup[sample_id]
    else:
        subject_data['entity_id'] = entity_ids_lookup[sample_id] = uuid.uuid4()

    u_members = []
    for member in subject_data['members']:
        if member['id'] not in entity_ids_lookup:
            entity_ids_lookup[member['id']] = uuid.uuid4()
        u_members.append({
            'id': convert_uuid_to_slug(entity_ids_lookup[member['id']]),
            'kind': member['kind'],
        })
    subject_data['members'] = u_members

    query = """
        INSERT INTO subjects_entity_id
        (  entity_id  )
        VALUES
        (%(entity_id)s);
        INSERT INTO subjects
        (  version_id  ,   created  ,   modified  ,
           entity_id  ,   previous_id  ,   language  ,   status  ,
           available  ,   tags  ,   name  ,   user_id  ,
           body  ,   members  )
        VALUES
        (%(version_id)s, %(created)s, %(modified)s,
         %(entity_id)s, %(previous_id)s, %(language)s, %(status)s,
         %(available)s, %(tags)s, %(name)s, %(user_id)s,
         %(body)s, %(members)s);
    """
    params = {
        'version_id': uuid.uuid4(),
        'created': datetime(2014, 1, 1, tzinfo=timezone.utc),
        'modified': datetime(2014, 1, 1, tzinfo=timezone.utc),
        'entity_id': subject_data['entity_id'],
        'previous_id': None,
        'language': 'en',
        'name': subject_data['name'],
        'status': 'accepted',
        'available': True,
        'tags': [],
        'user_id': founder_id,
        'body': subject_data['body'],
        'members': psycopg2.extras.Json(subject_data['members']),
    }


# users_subjects - intro electronic music...
electronic_subject_eid = entity_ids_lookup['subjectAll']
for user in users:
    query = """
        INSERT INTO users_subjects
        (user_id, subject_id)
        VALUES
        (%(user_id)s, %(subject_id)s);
    """
    params = {
        'user_id': convert_slug_to_uuid(user['id']),
        'subject_id': electronic_subject_eid,
    }
    save_row(pg_db_conn, query, params)


r_db_conn.close()
pg_db_conn.close()
es_populate()