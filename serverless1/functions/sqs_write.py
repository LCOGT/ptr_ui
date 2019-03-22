import boto3  
import json
import time

def lambda_handler(event, context):

    sqs = boto3.resource('sqs')

    queue = sqs.get_queue_by_name(QueueName='serverless-test1.fifo')
    
    dummy_command_1 = json.dumps({'device':  'enclosure_1',
                                  'timeout': '3h',
                                  'command': 'open'})
    event_string = json.dumps(event)
    send_time = json.dumps({
        "send time": time.time()
    })

    send_message = queue.send_message(MessageGroupId='ptr', MessageBody=send_time)
    #response = queue.send_message(MessageBody=json.dumps(event))

    response = {
        "statusCode": 200,
        "body": "message delivered to sqs",
        "headers": {
            "Access-Control-Allow-Origin":"*"
        },
        "isBase64Encoded": False,
    }

    return response
