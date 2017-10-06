from database.unit import list_many_unit_versions
from database.subject import list_many_subject_versions
from database.util import list_rows


def get_my_recent_proposals(db_conn, current_user):
    """
    Gets a list of the user's most recent proposals.
    """

    query = """
        SELECT *
        FROM posts
        WHERE kind = 'proposal' AND user_id = %(user_id)s
        ORDER BY created DESC;
        /* TODO offset limit */
    """
    params = {
        'user_id': current_user['id'],
    }
    return list_rows(db_conn, query, params)


def get_proposal_entity_versions(proposals, kind):
    """
    Given a list of proposals and a kind,
    pull out all the entity ids matching that kind.
    """

    entity_ids = []
    for proposal in proposals:
        for entity_version in proposal['entity_versions']:
            if entity_version['kind'] == kind:
                entity_ids.append(entity_version['id'])
    return entity_ids


def get_my_recently_created_units(db_conn, current_user):
    """
    Get the user's most recently created units.
    """

    proposals = get_my_recent_proposals(db_conn, current_user)
    unit_version_ids = get_proposal_entity_versions(proposals, 'unit')
    units = list_many_unit_versions(db_conn, unit_version_ids)
    return units


def get_my_recently_created_subjects(db_conn, current_user):
    """
    Get the user's most recently created subjects.
    """

    proposals = get_my_recent_proposals(db_conn, current_user)
    subject_version_ids = get_proposal_entity_versions(proposals, 'subject')
    subjects = list_many_subject_versions(db_conn, subject_version_ids)
    return subjects
