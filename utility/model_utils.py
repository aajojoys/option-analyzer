def model_add(Model, dict_field={}):
    obj = Model.objects.create(**dict_field)
    return obj

def model_bulkadd(Model, list_of_dict_field):
    ''' bulk_create:
    if the model’s primary key is an AutoField, the primary key attribute can only be retrieved on certain databases (currently PostgreSQL and MariaDB 10.5+). On other databases, it will not be set.
    link: https://docs.djangoproject.com/en/3.2/ref/models/querysets/
    '''
    objs = Model.objects.bulk_create(
        [ Model(**dict_field) for dict_field in list_of_dict_field ] 
    )
    return objs

def model_delete(Model, dictfield={}):
    objs = Model.objects.filter(**dictfield)
    return objs.delete()

def model_update(obj, dict_field):
    [ setattr(obj, key, value) for key, value in dict_field.items()]
    obj.save()
    return obj
    # return obj.update(**dict_field)

def model_bulkupdate(Model, objs, list_field):
    objs = Model.objects.bulk_update(objs, list_field)
    return objs

def model_get_fieldnames(Model, exclude_names=[]):
    """
    Get field names of model

    Args:
        Model (django.models.Model): target Model
        exclude_names (list): list of name to exclude from default Model._meta.fields e.g. id, user
    Returns:
        (list): list containing field names

    """
    fieldnames = [ field.name for field in Model._meta.fields if field.name not in exclude_names ]
    return fieldnames

def model_get_obj(Model, dict_field):
    try:
        obj = Model.objects.get(**dict_field)
        return obj
    except:
        return None

def model_get_all_objs(Model):
    return Model.objects.all()

def model_get_filter_objs(dict_field, objs=None, Model=None):
    '''
    if not objs captures both cases where objs is empty list or None, if objs is an empty list return objs; if objs is None get model_get_all_objs, with model_get_all_objs is None, return None
    '''
    if objs is None:
        objs = model_get_all_objs(Model)
    # elif not objs:
    if not objs:
        return objs

    return objs.filter(**dict_field)

def model_exclude_objs(dict_field, objs=None, Model=None):
    if objs is None:
        objs = model_get_all_objs(Model)
    if not objs:
        return objs

    return objs.exclude(**dict_field)

def model_get_objs_values(list_field, objs=None, Model=None, to_dict=False):
    """
    Get values from queryset

    Args:
        list_field (list): list containing desired field name
        objs (Model object): objs to extract values from
        Model (Model): selected Model
        to_dict (bool): True to return values in dict (field key: field value) (even for case with single field name); False to return list values for case with single field name; dict otherwise
    Returns:
        (list or dict): Model query values

    """
    if objs is None:
        objs = model_get_all_objs(Model)
    if not objs:
        return objs

    if to_dict or (len(list_field) > 1):
        return objs.values(*list_field)
    else:
        return objs.values_list(*list_field, flat=True)

def model_get_aggregate_value(field_name, aggregate_func, objs=None, Model=None):
    if objs is None:
        objs = model_get_all_objs(Model)
    if not objs:
        return None

    res = objs.aggregate(aggregate_func(field_name))
    key = field_name + "__" + aggregate_func.name.lower()
    return res[key]

def model_get_obj_dict(obj, del_keys=['user_id']):
    field_obj = obj.__dict__.copy()
    del_keys += ['_state']
    for del_key in del_keys:
        if field_obj.get(del_key): del field_obj[del_key]
    return field_obj

def model_get_or_create(Model, dictfield, defaults):
    """
    Return:
        query_obj (cls object): query object with dictfield provided
        created (bool): if instance is created or get
    """
    return Model.objects.get_or_create(**dictfield, defaults=defaults)
