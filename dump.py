import json
import sys
import os
from config import *


path = "tmp/%s/files/data/" % COURSE_ID
course_file = path + "course.json"
if not os.path.exists(course_file):
    sys.exit('ERROR: course.json file was not found in %s!' % course_file)

f=open(course_file)
course=json.load(f)

units=course['units']
#{u'html_review_form': None, u'html_check_answers': False, u'now_available': False, u'weight': 0, u'title': u'Introductie', u'html_content': None, u'release_date': u'', u'unit_id': 87, u'href': None, u'workflow_yaml': u'grader: auto\n', u'type': u'U'}

u=open("coursebuilder/data/unit.csv","w")
id=1
u.write("id,type,unit_id,title,release_date,now_available\n")
for unit in units:
    u.write("%s,%s,%s,%s,%s,%s\n" % (id, unit['type'], unit['unit_id'], unit['title'], unit['release_date'], 'True'))
    id=id+1
u.close()

def get_by_unit_id(unit_id):
    for unit in units:
        if unit_id == unit['unit_id']:
            return unit
    return False

#{u'scored': False, u'now_available': False, u'title': u'Video questionnaire', u'has_activity': True, u'objectives': u'<gcb-activity activityid="activity-86.js" instanceid="1SKmEMCOlA5V"></gcb-activity><br>', u'unit_id': 43, u'activity_title': u'', u'video': u'', u'lesson_id': 86, u'duration': u'', u'notes': u'', u'activity_listed': True}

id=1
import io
l=io.open("coursebuilder/data/lesson.csv","wt",encoding='utf-8' )
l.write(u"unit_id,unit_title,lesson_id,lesson_title,lesson_activity,lesson_activity_name,lesson_notes,lesson_video_id,lesson_objectives\n")
lessons=course['lessons']
last_unit = {}
for lesson in lessons:
    unit=get_by_unit_id(lesson['unit_id'])
    
    if unit['unit_id'] in last_unit:
        last_unit[unit['unit_id']]=last_unit[unit['unit_id']]+1
    else:
        last_unit[unit['unit_id']]=1

    try:
        l.write("%s,%s,%s,%s,%s,%s,%s,%s,\"%s\"\n" % (
            lesson['unit_id'],
            unit['title'],
            last_unit[unit['unit_id']],
            lesson['title'],
            "yes" if lesson['activity_listed'] else "",
            lesson['activity_title'],
            lesson['notes'],
            lesson['video'],
            lesson['objectives'].replace("\n","").replace('"',"'")))
    except Exception, e:
        #print Exception
        print e
        #print lesson['objectives']
    
    id = id+1



