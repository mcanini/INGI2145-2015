import boto, os
from boto.s3.connection import S3Connection
from boto.s3.key import Key

#DEBUG MODE: UNCOMMENT LINE BELOW FOR MORE VERBOSE LOGS
#boto.set_stream_logger('boto')

# -- Inputs --
# AWS credentials
# Don't hard-code your credentials!
# Export the following environment variables instead:
#
# export AWS_ACCESS_KEY_ID='AKID'
# export AWS_SECRET_ACCESS_KEY='SECRET'

# Tutorial params
bucket_name = 'ingi2145-thanh'
dl_path = "~/temp/files/"

#Step 1 -- Connect to Amazon S3
conn = S3Connection()

#Step 2 -- Create bucket with specified name
bucket = conn.create_bucket(bucket_name)

#Step 3 -- Create some objects
object_dict = {'foo':'This is just a foo', 'bar':'...this is the bar', 'exile':'this object is unwanted'}
for i in object_dict.keys():
  k = Key(bucket)
  k.key = i
  k.set_contents_from_string(object_dict.get(i))

#List objects inside the newly created bucket
bucket_list = bucket.list()
bl_str = 'This is a list of your keys:'
for j in bucket_list:
  bl_str = bl_str + ' ' + j.name
print bl_str

#Step 4 -- Delete one of the objects
print 'Deleting object: exile'
key_del = Key(bucket)
key_del.key = 'exile'
bucket.delete_key(key_del)

#Get the newly modified bucket list
bucket_list = bucket.list()

#Step 5 -- Download the objects to files on your local machine
print 'Downloading remaining objects to local files..'
if not os.path.exists(dl_path): #creates file storage directory
    os.makedirs(dl_path)
file_check = False
for l in bucket_list:
  key_string = str(l.key) + '.txt'
  #check if file exists locally, if not: download it and write each object to a separate file
  if not os.path.exists(dl_path+key_string):
    file_check = True
    print 'Creating file for key:', key_string
    l.get_contents_to_filename(dl_path+key_string)
  else:
    print 'File', key_string, 'already exists. Skipping..'
if not file_check:
  print 'All objects have already been written. Exiting..'

#Step 6 -- Delete all objects inside a bucket, then delete bucket
result = bucket.delete_keys([key.name for key in bucket_list])
conn.delete_bucket(bucket_name) #Note that bucket must be empty before it's deleted

