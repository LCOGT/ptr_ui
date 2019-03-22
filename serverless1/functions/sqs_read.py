import boto3
import json

def sqs_read(event, context):
    sqs_client = boto3.client('sqs')
    sqs = boto3.resource('sqs')
    queue_url = sqs_client.get_queue_url( QueueName="serverless-test1.fifo" )['QueueUrl']

    messages = []

    while True:
    
        response = sqs_client.receive_message(
            QueueUrl=queue_url,
            AttributeNames=[ 'SentTimestamp' ],
            MaxNumberOfMessages=10,    
            MessageAttributeNames=[ 'All' ],
            VisibilityTimeout=10,         #This CANNOT BE 0!  
            WaitTimeSeconds=0
        )
    
        try:
            length = -1
            length = len(response['Messages'])
            print('\n', length, ' messages in to_WMD_1 queue.\n')
            for index in range(length):
                message = response['Messages'][index]
                receipt_handle = message['ReceiptHandle']
                print(message['Body'], '  was received.\n')
                messages.append(message['Body'])
                delete_response = sqs_client.delete_message(QueueUrl=queue_url, ReceiptHandle=receipt_handle)
                #print('delete_response:  ', delete_response)
                continue
        except:
            print('\nto_WMD_1 queue is empty.\n')
            #time.sleep(3)   #lots of possibilities here.
            break  #Just to end this little demo
   

    http_resp = {
        "statusCode": 200,
        "body": json.dumps(messages),
        "headers": { "Access-Control-Allow-Origin": "*" },
        "isBase64Encoded": False,
    }

    return http_resp

