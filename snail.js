var http = require('http');
var process = require('process');
var qs = require('qs');
var api_key = process.env.INFRAPRINT_API_KEY;  // secret infraprint API key
var infraprint = require('infraprint')(api_key);
var AWS = require('aws-sdk');
var s3 = new AWS.S3();
var uuid = require('node-uuid'); //create GUID/UUIDs for file auth
/*
Needs the folliwng env-VARs:
INFRAPRINT_API_KEY - the api key for Infraprint
SECRET_CODE - the secret code that authenticates email requests
ADDRESS_LIST - a list of Infraprint address objectIDs
FROM_ADDRESS_ID - the Infraprint address object ID we are sending from
STORAGE_BUCKET - the AmazonS3 Bucket we want to use
AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY - Amazon AWS auth
*/

var REGULAR_ENVELOPE = 1, BLACK_AND_WHITE_DOCUMENT = 100, COLOR_DOCUMENT = 101;


http.createServer(function (req, res) {
  
  if {
	//if the request contains our secret api key, then it's legit.
	req.
	if (req.url == '/message/'){
		
	}
	//post the files to our Amazon S3 bucket
  }
}).listen(80);

function (request, response) {
    if (request.method == 'POST') {
        var body = '';
        request.on('data', function (data) {
            body += data;
            // 1e6 === 1 * Math.pow(10, 6) === 20 * 1000000 ~~~ 1MB
			//therefore, 2e7 is ~20MB
            if (body.length > 2e7) { 
                // FLOOD ATTACK OR FAULTY CLIENT, NUKE REQUEST
                request.connection.destroy();
            }
        });
        request.on('end', function () {

            var POST = qs.parse(body);
            // use POST
			email = JSON.parse(POST); //the data from Mandrill
			var file = '';
			res.writeHead(200, {'Content-Type': 'text/plain'});
			res.end('Mandrill Request Recieved\n');
			if (email.text.indexOf(process.env.SECRET_CODE) < 0){
				console.log("Error: Secret Code not present!");
				throw("Secret Code no present");
			}
			//let Mandrill know all is cool. So we don't get duplicate requests.
			for (var i=0; i<email.attachments.length; i++){
				var attachment = email.attachments[i];
				//now check for file type. We want a pdf or a docx attachment
				//mime type is prefered, but sometimes is finicky, hence the extra fileNameChecks
			
				var mimeIsPDF = attachment.type === 'application/pdf';
				var mimeIsDOCX = attachment.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
				var mimeIsDOC = attachment.type === 'application/msword';
				var fileNameHasDOC = attachment.name.indexOf('.doc') //because .doc will match .doc and .docx, a seperate .docx check is not made
				var fileNameHasPDF = attachment[i].name.indexOf('.pdf')
				if (mimeIsPDF || mimeIsDOCX || mimeIsDOC || fileNameHasDOC || fileNameHasPDF){
					//use the first pdf or Word doc attachment in the email
					//User should only attach the one, but yeah
					//whichever comes across first, wins
					file = attachment;
					break;
				}
			}
			var objectID = create_object(file.content); //new Infraprint object with the our new PDF or DOCX
			var addresses = JSON.parse(process.env.ADDRESS_LIST);
			send_to_addresses(addresses, [objectID]);
        });
    }
}

console.log('Server running on port 80');

function create_object(fileContent, paper_setting){
	/*
	File Content is the file, as a string.
	Paper setting is optional, defaults to Black and White Document. Specifiy otherwise if needed
	*/
	var paper_setting = typeof paper_setting !== 'undefined' ? paper_setting : BLACK_AND_WHITE_DOCUMENT;
	var fileName = uuid.v1(); //prevent collisions by creating a GUID for this file
	var params = {Bucket: process.env.STORAGE_BUCKET, Key: fileName, Body: fileContent};
	var url = s3.getSignedUrl('putObject', params, function(err, data) {
		if (err){
		  console.log(err);
		  throw(err);
		}
		else{
			console.log("Successfully file with objectID of", fileName, " and url of ", url);
			infraprint.objects.create(
				{
					name:fileName,
					url: url,
					setting_id: paper_setting;
				},
				function(err, object) {
					if (err) {
						console.log("Couldn't create the Infraprint object");
						console.log(err);
						throw(err);
					}
					console.log("created object id", object.id);
					return object.id;
				}
			)
		}
	});
}

/*
function generate_custom_greeting(addressID){
    var address = infraprint.addresses.retrieve(addressID);
	var person_name = address.name; //now we have the person's name, which we can use to greet them
	doc.text("Hullo World!", align:"center")
	var pdfContent = doc.output; //the raw output in .pdf format
	object = create_object(pdfContent);
	return object.id;
}
Not in use for now, not important for immediacy
*/

function send_to_addresses(addressArray, objectArray){
	/*
	Addresses Array has all the addresses we want to send to. We need to create a seperate job for each address.
	Object Array allows for multiple objects. For instance, we could have a color photo along with some B/W document in the same envelope
	Object Array *very* useful for having a customized bit of info sent out with the person's name on it.
	*/
	var from = process.env.FROM_ADDRESS_ID;
	for (var i=0; i < addressArray.length; i++){
		var params = {}
		params.name = uuid.v1();
		params.from = from;
		params.packaging_id = REGULAR_ENVELOPE;
		for (var j=0; j < objectArray.length; i++){
			params['object' + j+1] = objectArray[i];
		}
		infraprint.print_jobs.create(params, function (err, job){
			if (err) {
			 console.log("Couldn't create the job with the following params: ", params);
			 return;
			}
			console.log("created job id", job.id);
		}
	}
}