var readerSchema = new mongoose.Schema({username: String, password: String});
var ModelReader = mongoose.model('Reader', readerSchema);

function createNewReader() {
	var user = queryselector("#username").value;
	var pass = queryselector("#password").value;

	ModelReader.find()

	var newReader = new ModelReader({username: user, password: pass});
	newReader.save(function (err) {
		if (err) {console.log("Failed to Save to Database");}
	});
}

function readerSignIn() {
	var user = queryselector('#username').value;
	var pass = queryselector('#password').value;

	var reader = ModelReader.find({name: user}, function (error) {
		if (error) { /*Reload the login page, informing the reader that this username 
						doesn't exist. Then return?*/}

		if (reader.password != pass) {
			/*Reload login page informing the reader that their password is incorrect.*/
		}
		else { //All is well, now i gotta start thinking about 'sessions.' Is there a bit of 
				//advice you can give me to start me thinking about this? Just guessing, I've
				//heard plenty about cookies, and the like, but as usual, I'm a bit slow to grasp
				//the way I'm supposed to work this out.
		}
	});

	
}