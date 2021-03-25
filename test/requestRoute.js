//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

var User = require('../models/user');

var projectService = require('../services/projectService');
var requestService = require('../services/requestService');
var userService = require('../services/userService');
var leadService = require('../services/leadService');


//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app');
let should = chai.should();
var winston = require('../config/winston');

var Department = require('../models/department');
var faqService = require('../services/faqService');
// require('../services/mongoose-cache-fn')(mongoose);

// chai.config.includeStack = true;

var expect = chai.expect;
var assert = chai.assert;

chai.use(chaiHttp);

describe('RequestRoute', () => {



  it('create', function (done) {
    // this.timeout(10000);

    var email = "test-request-create-" + Date.now() + "@email.com";
    var pwd = "pwd";

    userService.signup( email ,pwd, "Test Firstname", "Test lastname").then(function(savedUser) {
     projectService.create("request-create", savedUser._id).then(function(savedProject) {
     

          chai.request(server)
            .post('/'+ savedProject._id + '/requests/')
            .auth(email, pwd)
            .set('content-type', 'application/json')
            .send({"text":"first_text"})
            .end(function(err, res) {
                //console.log("res",  res);
                console.log("res.body",  res.body);
                res.should.have.status(200);
                res.body.should.be.a('object');
                
                expect(res.body.snapshot.agents.length).to.equal(1);
                // res.body.should.have.property('request_id').eql('request_id');
                // res.body.should.have.property('requester_id').eql('requester_id');
                res.body.should.have.property('first_text').eql('first_text');
                res.body.should.have.property('id_project').eql(savedProject._id.toString());
                res.body.should.have.property('createdBy').eql(savedUser._id.toString());

                // res.body.should.have.property('messages_count').gt(0);

                res.body.should.have.property('status').eql(200);
                
                // res.body.should.have.property('agents').eql(savedUser._id);
                expect(res.body.snapshot.agents.length).to.equal(1);
                expect(res.body.participants.length).to.equal(1);

                expect(res.body.participantsAgents.length).to.equal(1);                
                expect(res.body.participantsBots).to.have.lengthOf(0);
                expect(res.body.hasBot).to.equal(false);           

                res.body.should.have.property('department').not.eql(null);
                // res.body.should.have.property('lead').eql(undefined);
                            
          
               done();
            });
    });
  });
});





it('createUpperCaseEmail', function (done) {
  // this.timeout(10000);

  var now = Date.now();
  var email = "test-REQUEST-create-" + now + "@email.com";
  var pwd = "pwd";

  userService.signup( email ,pwd, "Test Firstname", "Test lastname").then(function(savedUser) {
   projectService.create("request-create", savedUser._id).then(function(savedProject) {
   

        chai.request(server)
          .post('/'+ savedProject._id + '/requests/')
          .auth("test-request-create-" + now + "@email.com", pwd)
          .set('content-type', 'application/json')
          .send({"text":"first_text"})
          .end(function(err, res) {
              //console.log("res",  res);
              console.log("res.body",  res.body);
              res.should.have.status(200);
              res.body.should.be.a('object');
              
              expect(res.body.snapshot.agents.length).to.equal(1);
              // res.body.should.have.property('request_id').eql('request_id');
              // res.body.should.have.property('requester_id').eql('requester_id');
              res.body.should.have.property('first_text').eql('first_text');
              res.body.should.have.property('id_project').eql(savedProject._id.toString());
              res.body.should.have.property('createdBy').eql(savedUser._id.toString());

              // res.body.should.have.property('messages_count').gt(0);

              res.body.should.have.property('status').eql(200);
              
              // res.body.should.have.property('agents').eql(savedUser._id);
              expect(res.body.snapshot.agents.length).to.equal(1);
              expect(res.body.participants.length).to.equal(1);

              expect(res.body.participantsAgents.length).to.equal(1);                
              expect(res.body.participantsBots).to.have.lengthOf(0);
              expect(res.body.hasBot).to.equal(false);           

              res.body.should.have.property('department').not.eql(null);
              // res.body.should.have.property('lead').eql(undefined);
                          
        
             done();
          });
  });
});
});





  it('getbyid', function (done) {
    // this.timeout(10000);

    var email = "test-signup-" + Date.now() + "@email.com";
    var pwd = "pwd";

    userService.signup( email ,pwd, "Test Firstname", "Test lastname").then(function(savedUser) {
     projectService.createAndReturnProjectAndProjectUser("createWithId", savedUser._id).then(function(savedProjectAndPU) {
      var savedProject = savedProjectAndPU.project;


      // leadService.createIfNotExists("leadfullname", "email@email.com", savedProject._id).then(function(createdLead) {
      // createWithId(request_id, requester_id, id_project, first_text, departmentid, sourcePage, language, userAgent, status) {
      //  requestService.createWithId("request_id1", createdLead._id, savedProject._id, "first_text").then(function(savedRequest) {
        requestService.createWithIdAndRequester("request_requestroute-getbyid", savedProjectAndPU.project_user._id,null, savedProject._id, "first_text").then(function(savedRequest) {
          winston.debug("resolve", savedRequest.toObject());
         

          chai.request(server)
            .get('/'+ savedProject._id + '/requests/'+savedRequest.request_id)
            .auth(email, pwd)
            .end(function(err, res) {
                //console.log("res",  res);

                 console.log("res.body",  res.body);

                res.should.have.status(200);
                res.body.should.be.a('object');
                
                res.body.should.have.property('department').not.eql(null);
                // res.body.should.have.property('lead').eql(null);
                res.body.should.have.property('request_id').eql("request_requestroute-getbyid");                
                res.body.should.have.property('requester').not.eql(null);    
                
                expect(res.body.participantsAgents.length).to.equal(1);                
                expect(res.body.participantsBots).to.have.lengthOf(0);
                expect(res.body.hasBot).to.equal(false);
    
                expect(res.body.participatingAgents.length).to.equal(1);        
                expect(res.body.participatingBots.length).to.equal(0);        

                expect(res.body.participatingAgents.length).to.equal(1);                
                expect(res.body.participatingBots).to.have.lengthOf(0);
                
                expect(res.body.requester._id).to.not.equal(savedProjectAndPU.project_user._id);
                expect(res.body.requester.isAuthenticated).to.equal(true);
               done();
            });
            // .catch(function(err) {
            //     console.log("test reject", err);
            //     assert.isNotOk(err,'Promise error');
            //     done();
            // });
    // });
  });
});
    });
});
// mocha test/requestRoute.js  --grep 'getbyidWithPartecipatingBots'


it('getbyidWithPartecipatingBots', function (done) {
  // this.timeout(10000);

  var email = "test-signup-" + Date.now() + "@email.com";
  var pwd = "pwd";

  userService.signup( email ,pwd, "Test Firstname", "Test lastname").then(function(savedUser) {
   projectService.createAndReturnProjectAndProjectUser("createWithId", savedUser._id).then(function(savedProjectAndPU) {
    var savedProject = savedProjectAndPU.project;


      faqService.create("testbot", null, savedProject._id, savedUser._id, "internal").then(function(savedBot) {  
                    


        Department.findOneAndUpdate({id_project: savedProject._id, default:true}, {id_bot:savedBot._id},{ new: true, upsert: false }, function (err, updatedDepartment) {

          winston.error("err", err);
          winston.info("updatedDepartment", updatedDepartment.toObject());


    // leadService.createIfNotExists("leadfullname", "email@email.com", savedProject._id).then(function(createdLead) {
    // createWithId(request_id, requester_id, id_project, first_text, departmentid, sourcePage, language, userAgent, status) {
    //  requestService.createWithId("request_id1", createdLead._id, savedProject._id, "first_text").then(function(savedRequest) {
      requestService.createWithIdAndRequester("request_requestroute-getbyidWithPartecipatingBots", savedProjectAndPU.project_user._id,null, savedProject._id, "first_text").then(function(savedRequest) {
        winston.debug("resolve", savedRequest.toObject());
       

        chai.request(server)
          .get('/'+ savedProject._id + '/requests/'+savedRequest.request_id)
          .auth(email, pwd)
          .end(function(err, res) {
              //console.log("res",  res);

               console.log("res.body",  res.body);

              res.should.have.status(200);
              res.body.should.be.a('object');
              
              res.body.should.have.property('department').not.eql(null);
                            
              // res.body.should.have.property('lead').eql(null);
              res.body.should.have.property('request_id').eql("request_requestroute-getbyidWithPartecipatingBots");                
              res.body.should.have.property('requester').not.eql(null);                
              expect(res.body.requester._id).to.not.equal(savedProjectAndPU.project_user._id);

              expect(res.body.participatingAgents.length).to.equal(0);        
              expect(res.body.participatingBots.length).to.equal(1);

              expect(res.body.participantsAgents.length).to.equal(0);                
              expect(res.body.participantsBots).to.have.lengthOf(1);
              expect(res.body.hasBot).to.equal(true);

            
              expect(res.body.department.hasBot).to.equal(true);

             done();
          });
          // .catch(function(err) {
          //     console.log("test reject", err);
          //     assert.isNotOk(err,'Promise error');
          //     done();
          // });
  // });
});
});
      });
    });
  });
});


// mocha test/requestRoute.js  --grep 'getallSimple'

  it('getallSimple', function (done) {
    // this.timeout(10000);

    var email = "test-getallsimple-" + Date.now() + "@email.com";
    var pwd = "pwd";

    userService.signup( email, pwd, "Test Firstname", "Test lastname").then(function(savedUser) {

    console.log("savedUser", savedUser);

    projectService.createAndReturnProjectAndProjectUser("createWithId", savedUser._id).then(function(savedProjectAndPU) {

    var savedProject = savedProjectAndPU.project;

    console.log("savedProjectAndPU", savedProjectAndPU);

    leadService.createIfNotExists("leadfullname", "email-getallSimple@email.com", savedProject._id).then(function(createdLead) {

    console.log("createdLead", createdLead);


    var new_request = {
      request_id: "request_id1", project_user_id:savedProjectAndPU.project_user._id, lead_id:createdLead._id,
      id_project:savedProject._id, first_text: "first_text",
      lead:createdLead, requester: savedProjectAndPU.project_user 
    };
  
  
        
    requestService.create(new_request).then(function(savedRequest) {

      console.log("savedRequest", savedRequest);

      // createWithId(request_id, requester_id, id_project, first_text, departmentid, sourcePage, language, userAgent, status) {
      //  requestService.createWithId("request_id1", createdLead._id, savedProject._id, "first_text").then(function(savedRequest) {
        // requestService.createWithIdAndRequester("request_id1", savedProjectAndPU.project_user._id, null,savedProject._id, "first_text").then(function(savedRequest) {

          winston.debug("resolve", savedRequest.toObject());
         

          chai.request(server)
            .get('/'+ savedProject._id + '/requests/')
            .auth(email, pwd)
            .end(function(err, res) {
                //console.log("res",  res);
                console.log("res.body",  res.body);
                res.should.have.status(200);
                res.body.should.be.a('object');

                expect(res.body.requests[0].department).to.not.equal(null);
                expect(res.body.requests[0].requester).to.not.equal(null);
                console.log("res.body.requests[0].requester",  res.body.requests[0].requester);

                expect(res.body.requests[0].requester.id_user.firstname).to.equal("Test Firstname");

                expect(res.body.requests[0].participantsAgents.length).to.equal(1);                
                expect(res.body.requests[0].participantsBots).to.have.lengthOf(0);
                expect(res.body.requests[0].hasBot).to.equal(false);
                expect(res.body.requests[0].snapshot).to.not.equal(undefined);
                expect(res.body.requests[0].snapshot.department.name).to.not.equal(null);
                expect(res.body.requests[0].snapshot.agents.length).to.equal(1);
                expect(res.body.requests[0].snapshot.availableAgentsCount).to.equal(1);
                expect(res.body.requests[0].snapshot.lead.fullname).to.equal("leadfullname");
                expect(res.body.requests[0].snapshot.requester.role).to.equal("owner");
                // expect(res.body.requests[0].participatingAgents.length).to.equal(1);        
                // expect(res.body.requests[0].participatingBots.length).to.equal(0);
               done();
            });
            // .catch(function(err) {
            //     console.log("test reject", err);
            //     assert.isNotOk(err,'Promise error');
            //     done();
            // });
    });
  });
});
    });
});



  // mocha test/requestRoute.js  --grep 'getallNoPopulate'

it('getallNoPopulate', function (done) {
  // this.timeout(10000);

  var email = "test-signup-" + Date.now() + "@email.com";
  var pwd = "pwd";

  userService.signup( email ,pwd, "Test Firstname", "Test lastname").then(function(savedUser) {
   projectService.createAndReturnProjectAndProjectUser("createWithId-getallNoPopulate", savedUser._id).then(function(savedProjectAndPU) {
    var savedProject = savedProjectAndPU.project;

    
    leadService.createIfNotExists("leadfullname", "email@email.com", savedProject._id).then(function(createdLead) {
    // createWithId(request_id, requester_id, id_project, first_text, departmentid, sourcePage, language, userAgent, status) {
    //  requestService.createWithId("request_id1", createdLead._id, savedProject._id, "first_text").then(function(savedRequest) {

      var request = {
        request_id:"request_id1", project_user_id:savedProjectAndPU.project_user._id, lead_id:createdLead._id,
        id_project:savedProject._id, first_text: "first_text",
        lead:createdLead, requester: savedProjectAndPU.project_user };


      
      requestService.create(request).then(function(savedRequest) {
  
      // requestService.createWithIdAndRequester("request_id1", savedProjectAndPU.project_user._id, null,savedProject._id, "first_text").then(function(savedRequest) {

        winston.debug("resolve", savedRequest.toObject());
       

        chai.request(server)
          .get('/'+ savedProject._id + '/requests/?no_populate=true')
          .auth(email, pwd)
          .end(function(err, res) {
              //console.log("res",  res);
              console.log("res.body",  res.body);
              res.should.have.status(200);
              res.body.should.be.a('object');
              // assert.isString(res.body.requests[0].department, 'order placed');

              expect(res.body.requests[0].department).to.be.a('string');
              expect(res.body.requests[0].requester).to.be.a('string');
              // console.log("res.body.requests[0].requester",  res.body.requests[0].requester);
              // expect(res.body.requests[0].requester.id_user.firstname).to.equal("Test Firstname");

              console.log("res.body.requests[0].participantsAgents", res.body.requests[0].participantsAgents);
              expect(res.body.requests[0].participantsAgents).to.have.lengthOf(1);
              expect(res.body.requests[0].participantsAgents[0]).to.equal(savedUser._id.toString());
              expect(res.body.requests[0].participantsBots).to.have.lengthOf(0);
              expect(res.body.requests[0].hasBot).to.equal(false);
              
              expect(res.body.requests[0].snapshot).to.not.equal(undefined);
              expect(res.body.requests[0].snapshot.department.name).to.not.equal(null);
              expect(res.body.requests[0].snapshot.agents.length).to.equal(1);
              // expect(res.body.requests[0].test).to.not.equal(undefined);
              // expect(res.body.requests[0].participatingAgents.length).to.equal(1);        
              // expect(res.body.requests[0].participatingBots.length).to.equal(0);
             done();
          });
          // .catch(function(err) {
          //     console.log("test reject", err);
          //     assert.isNotOk(err,'Promise error');
          //     done();
          // });
  // });
        });
});
});
  });
});





// mocha test/requestRoute.js  --grep 'getallSimple'

it('getallFilter-snap_department_routing', function (done) {
  // this.timeout(10000);

  var email = "test-getallfilter-" + Date.now() + "@email.com";
  var pwd = "pwd";

  userService.signup( email, pwd, "Test Firstname", "Test lastname").then(function(savedUser) {

  console.log("savedUser", savedUser);

  projectService.createAndReturnProjectAndProjectUser("createWithId", savedUser._id).then(function(savedProjectAndPU) {

  var savedProject = savedProjectAndPU.project;

  console.log("savedProjectAndPU", savedProjectAndPU);

  leadService.createIfNotExists("leadfullname", "email-getallfilter@email.com", savedProject._id).then(function(createdLead) {

  console.log("createdLead", createdLead);


  var new_request = {
    request_id: "request_id1", project_user_id:savedProjectAndPU.project_user._id, lead_id:createdLead._id,
    id_project:savedProject._id, first_text: "first_text",
    lead:createdLead, requester: savedProjectAndPU.project_user 
  };


      
  requestService.create(new_request).then(function(savedRequest) {

    console.log("savedRequest", savedRequest);

    // createWithId(request_id, requester_id, id_project, first_text, departmentid, sourcePage, language, userAgent, status) {
    //  requestService.createWithId("request_id1", createdLead._id, savedProject._id, "first_text").then(function(savedRequest) {
      // requestService.createWithIdAndRequester("request_id1", savedProjectAndPU.project_user._id, null,savedProject._id, "first_text").then(function(savedRequest) {

        winston.debug("resolve", savedRequest.toObject());
       

        chai.request(server)
          .get('/'+ savedProject._id + '/requests/?snap_department_routing=assigned')
          .auth(email, pwd)
          .end(function(err, res) {
              //console.log("res",  res);
              console.log("res.body",  res.body);
              res.should.have.status(200);
              res.body.should.be.a('object');

              expect(res.body.requests[0].department).to.not.equal(null);
              expect(res.body.requests[0].requester).to.not.equal(null);
              console.log("res.body.requests[0].requester",  res.body.requests[0].requester);

              expect(res.body.requests[0].requester.id_user.firstname).to.equal("Test Firstname");

              expect(res.body.requests[0].participantsAgents.length).to.equal(1);                
              expect(res.body.requests[0].participantsBots).to.have.lengthOf(0);
              expect(res.body.requests[0].hasBot).to.equal(false);
              expect(res.body.requests[0].snapshot).to.not.equal(undefined);
              expect(res.body.requests[0].snapshot.department.name).to.not.equal(null);
              expect(res.body.requests[0].snapshot.agents.length).to.equal(1);
              expect(res.body.requests[0].snapshot.availableAgentsCount).to.equal(1);
              expect(res.body.requests[0].snapshot.lead.fullname).to.equal("leadfullname");
              expect(res.body.requests[0].snapshot.requester.role).to.equal("owner");
              // expect(res.body.requests[0].participatingAgents.length).to.equal(1);        
              // expect(res.body.requests[0].participatingBots.length).to.equal(0);
             done();
          });
          // .catch(function(err) {
          //     console.log("test reject", err);
          //     assert.isNotOk(err,'Promise error');
          //     done();
          // });
  });
});
});
  });
});




// mocha test/requestRoute.js  --grep 'getallSimple'

it('getallFilter-snap_department_default', function (done) {
  // this.timeout(10000);

  var email = "test-getallfilter-" + Date.now() + "@email.com";
  var pwd = "pwd";

  userService.signup( email, pwd, "Test Firstname", "Test lastname").then(function(savedUser) {

  console.log("savedUser", savedUser);

  projectService.createAndReturnProjectAndProjectUser("createWithId", savedUser._id).then(function(savedProjectAndPU) {

  var savedProject = savedProjectAndPU.project;

  console.log("savedProjectAndPU", savedProjectAndPU);

  leadService.createIfNotExists("leadfullname", "email-getallfilter@email.com", savedProject._id).then(function(createdLead) {

  console.log("createdLead", createdLead);


  var new_request = {
    request_id: "request_id1", project_user_id:savedProjectAndPU.project_user._id, lead_id:createdLead._id,
    id_project:savedProject._id, first_text: "first_text",
    lead:createdLead, requester: savedProjectAndPU.project_user 
  };


      
  requestService.create(new_request).then(function(savedRequest) {

    console.log("savedRequest", savedRequest);

    // createWithId(request_id, requester_id, id_project, first_text, departmentid, sourcePage, language, userAgent, status) {
    //  requestService.createWithId("request_id1", createdLead._id, savedProject._id, "first_text").then(function(savedRequest) {
      // requestService.createWithIdAndRequester("request_id1", savedProjectAndPU.project_user._id, null,savedProject._id, "first_text").then(function(savedRequest) {

        winston.debug("resolve", savedRequest.toObject());
       

        chai.request(server)
          .get('/'+ savedProject._id + '/requests/?snap_department_default=true')
          .auth(email, pwd)
          .end(function(err, res) {
              //console.log("res",  res);
              console.log("res.body",  res.body);
              res.should.have.status(200);
              res.body.should.be.a('object');

              expect(res.body.requests[0].department).to.not.equal(null);
              expect(res.body.requests[0].requester).to.not.equal(null);
              console.log("res.body.requests[0].requester",  res.body.requests[0].requester);

              expect(res.body.requests[0].requester.id_user.firstname).to.equal("Test Firstname");

              expect(res.body.requests[0].participantsAgents.length).to.equal(1);                
              expect(res.body.requests[0].participantsBots).to.have.lengthOf(0);
              expect(res.body.requests[0].hasBot).to.equal(false);
              expect(res.body.requests[0].snapshot).to.not.equal(undefined);
              expect(res.body.requests[0].snapshot.department.name).to.not.equal(null);
              expect(res.body.requests[0].snapshot.agents.length).to.equal(1);
              expect(res.body.requests[0].snapshot.availableAgentsCount).to.equal(1);
              expect(res.body.requests[0].snapshot.lead.fullname).to.equal("leadfullname");
              expect(res.body.requests[0].snapshot.requester.role).to.equal("owner");
              // expect(res.body.requests[0].participatingAgents.length).to.equal(1);        
              // expect(res.body.requests[0].participatingBots.length).to.equal(0);
             done();
          });
          // .catch(function(err) {
          //     console.log("test reject", err);
          //     assert.isNotOk(err,'Promise error');
          //     done();
          // });
  });
});
});
  });
});




// mocha test/requestRoute.js  --grep 'snap_department_id_bot_exists'

it('getallFilter-snap_department_id_bot_exists', function (done) {
  // this.timeout(10000);

  var email = "test-getallfilter-" + Date.now() + "@email.com";
  var pwd = "pwd";

  userService.signup( email, pwd, "Test Firstname", "Test lastname").then(function(savedUser) {

  console.log("savedUser", savedUser);

  projectService.createAndReturnProjectAndProjectUser("createWithId", savedUser._id).then(function(savedProjectAndPU) {

  var savedProject = savedProjectAndPU.project;

  console.log("savedProjectAndPU", savedProjectAndPU);

  leadService.createIfNotExists("leadfullname", "email-getallfilter@email.com", savedProject._id).then(function(createdLead) {

  console.log("createdLead", createdLead);


  var new_request = {
    request_id: "request_id1", project_user_id:savedProjectAndPU.project_user._id, lead_id:createdLead._id,
    id_project:savedProject._id, first_text: "first_text",
    lead:createdLead, requester: savedProjectAndPU.project_user 
  };


      
  requestService.create(new_request).then(function(savedRequest) {

    console.log("savedRequest", savedRequest);

    // createWithId(request_id, requester_id, id_project, first_text, departmentid, sourcePage, language, userAgent, status) {
    //  requestService.createWithId("request_id1", createdLead._id, savedProject._id, "first_text").then(function(savedRequest) {
      // requestService.createWithIdAndRequester("request_id1", savedProjectAndPU.project_user._id, null,savedProject._id, "first_text").then(function(savedRequest) {

        winston.debug("resolve", savedRequest.toObject());
       

        chai.request(server)
          .get('/'+ savedProject._id + '/requests/?snap_department_id_bot_exists=false')
          .auth(email, pwd)
          .end(function(err, res) {
              //console.log("res",  res);
              console.log("res.body",  res.body);
              res.should.have.status(200);
              res.body.should.be.a('object');

              expect(res.body.requests[0].department).to.not.equal(null);
              expect(res.body.requests[0].requester).to.not.equal(null);
              console.log("res.body.requests[0].requester",  res.body.requests[0].requester);

              expect(res.body.requests[0].requester.id_user.firstname).to.equal("Test Firstname");

              expect(res.body.requests[0].participantsAgents.length).to.equal(1);                
              expect(res.body.requests[0].participantsBots).to.have.lengthOf(0);
              expect(res.body.requests[0].hasBot).to.equal(false);
              expect(res.body.requests[0].snapshot).to.not.equal(undefined);
              expect(res.body.requests[0].snapshot.department.name).to.not.equal(null);
              expect(res.body.requests[0].snapshot.agents.length).to.equal(1);
              expect(res.body.requests[0].snapshot.availableAgentsCount).to.equal(1);
              expect(res.body.requests[0].snapshot.lead.fullname).to.equal("leadfullname");
              expect(res.body.requests[0].snapshot.requester.role).to.equal("owner");
              // expect(res.body.requests[0].participatingAgents.length).to.equal(1);        
              // expect(res.body.requests[0].participatingBots.length).to.equal(0);
             done();
          });
          // .catch(function(err) {
          //     console.log("test reject", err);
          //     assert.isNotOk(err,'Promise error');
          //     done();
          // });
  });
});
});
  });
});


// mocha test/requestRoute.js  --grep 'getallcsv'
it('getallcsv', function (done) {
  // this.timeout(10000);

  var email = "test-signup-" + Date.now() + "@email.com";
  var pwd = "pwd";

  userService.signup( email ,pwd, "Test Firstname", "Test lastname").then(function(savedUser) {
   projectService.createAndReturnProjectAndProjectUser("getallcsv", savedUser._id).then(function(savedProjectAndPU) {

    var savedProject = savedProjectAndPU.project;
    leadService.createIfNotExists("leadfullname", "email@email.com", savedProject._id).then(function(createdLead) {

    winston.info("createdLead", createdLead.toObject());
      // createWithIdAndRequester(request_id, project_user_id, lead_id, id_project, first_text, departmentid, sourcePage, language, userAgent, status, createdBy, attributes, subject, preflight, channel, location) {

     requestService.createWithIdAndRequester("request_id1", savedProjectAndPU.project_user._id, createdLead._id, savedProject._id, "first_text").then(function(savedRequest) {
        winston.info("resolve", savedRequest.toObject());
       

        chai.request(server)
          .get('/'+ savedProject._id + '/requests/csv/')
          .auth(email, pwd)
          .end(function(err, res) {
              //console.log("res",  res);
              // console.log("res.body",  res.body);
              res.should.have.status(200);
              res.body.should.be.a('object');
             
        
             done();
          });
          // .catch(function(err) {
          //     console.log("test reject", err);
          //     assert.isNotOk(err,'Promise error');
          //     done();
          // });
  });
});
});
  });
});





it('getallWithLoLead', function (done) {
  // this.timeout(10000);

  var email = "test-signup-" + Date.now() + "@email.com";
  var pwd = "pwd";

  userService.signup( email ,pwd, "Test Firstname", "Test lastname").then(function(savedUser) {

    projectService.createAndReturnProjectAndProjectUser("getallcsv", savedUser._id).then(function(savedProjectAndPU) {

      var savedProject = savedProjectAndPU.project;
      leadService.createIfNotExists("request_id1-getallWithLoLead", "email@getallWithLoLead.com", savedProject._id).then(function(createdLead) {      
  
      winston.info("createdLead", createdLead.toObject());
        // createWithIdAndRequester(request_id, project_user_id, lead_id, id_project, first_text, departmentid, sourcePage, language, userAgent, status, createdBy, attributes, subject, preflight, channel, location) {
  
       requestService.createWithIdAndRequester("request_id1", savedProjectAndPU.project_user._id,createdLead._id, savedProject._id, "first_text").then(function(savedRequest) {

        winston.debug("resolve", savedRequest.toObject());
       

        chai.request(server)
          .get('/'+ savedProject._id + '/requests/')
          .auth(email, pwd)
          .end(function(err, res) {
              // console.log("res",  res);
              // console.log("res.body",  res.body);
              res.should.have.status(200);
              res.body.should.be.a('object');
              expect(res.body.requests[0].department).to.not.equal(null);
              expect(res.body.requests[0].lead).to.not.equal(null);
        
             done();
          });
          // .catch(function(err) {
          //     console.log("test reject", err);
          //     assert.isNotOk(err,'Promise error');
          //     done();
          // });
  });
});
  });
});
});


  describe('/assign', () => {
 
   


// mocha test/requestRoute.js  --grep 'createAndReassign'

  it('createAndReassign', function (done) {
    // this.timeout(10000);

    var email = "test-request-create-" + Date.now() + "@email.com";
    var pwd = "pwd";

    userService.signup( email ,pwd, "Test Firstname", "Test lastname").then(function(savedUser) {
     projectService.create("request-create", savedUser._id).then(function(savedProject) {
     

          chai.request(server)
            .post('/'+ savedProject._id + '/requests/')
            .auth(email, pwd)
            .set('content-type', 'application/json')
            .send({"text":"first_text"})
            .end(function(err, res) {
                //console.log("res",  res);
                console.log("res.body",  res.body);
                res.should.have.status(200);
                res.body.should.be.a('object');
                
                expect(res.body.snapshot.agents.length).to.equal(1);
                // res.body.should.have.property('request_id').eql('request_id');
                // res.body.should.have.property('requester_id').eql('requester_id');
                res.body.should.have.property('first_text').eql('first_text');
                res.body.should.have.property('id_project').eql(savedProject._id.toString());
                res.body.should.have.property('createdBy').eql(savedUser._id.toString());

                // res.body.should.have.property('messages_count').gt(0);

                res.body.should.have.property('status').eql(200);
                
                // res.body.should.have.property('agents').eql(savedUser._id);
                expect(res.body.snapshot.agents.length).to.equal(1);
                expect(res.body.participants.length).to.equal(1);

                expect(res.body.participantsAgents.length).to.equal(1);                
                expect(res.body.participantsBots).to.have.lengthOf(0);
                expect(res.body.hasBot).to.equal(false);           

                res.body.should.have.property('department').not.eql(null);
                // res.body.should.have.property('lead').eql(undefined);
                            
                console.log("res.body.request_id: "+ res.body.request_id);

                chai.request(server)
                .put('/'+ savedProject._id + '/requests/'+res.body.request_id+"/departments")
                .auth(email, pwd)
                .set('content-type', 'application/json')
                .send({})
                .end(function(err, res2) {
                    //console.log("res",  res);
                    console.log("res.body",  res2.body);
                    res2.should.have.status(200);
                    res2.body.should.be.a('object');
                    expect(res.body.participants.length).to.equal(1);
                    expect(res.body.participantsAgents.length).to.equal(1);
                    expect(res.body.participantsBots.length).to.equal(0);

                  
                    
                    res2.body.requester.should.be.a('object');
                    res2.body.lead.should.be.a('object');
                    // expect(res.body.requester).to.equal(undefined);                
                    // expect(res.body.lead).to.equal(undefined);                

                    done(); 
                });
               
            });
    });
  });
});



// mocha test/requestRoute.js  --grep 'createAndReassignAndNoPopulate'

  it('createAndReassignAndNoPopulate', function (done) {
    // this.timeout(10000);

    var email = "test-request-create-" + Date.now() + "@email.com";
    var pwd = "pwd";

    userService.signup( email ,pwd, "Test Firstname", "Test lastname").then(function(savedUser) {
     projectService.create("request-create", savedUser._id).then(function(savedProject) {
     

          chai.request(server)
            .post('/'+ savedProject._id + '/requests/')
            .auth(email, pwd)
            .set('content-type', 'application/json')
            .send({"text":"first_text"})
            .end(function(err, res) {
                //console.log("res",  res);
                console.log("res.body",  res.body);
                res.should.have.status(200);
                res.body.should.be.a('object');
                
                expect(res.body.snapshot.agents.length).to.equal(1);
                // res.body.should.have.property('request_id').eql('request_id');
                // res.body.should.have.property('requester_id').eql('requester_id');
                res.body.should.have.property('first_text').eql('first_text');
                res.body.should.have.property('id_project').eql(savedProject._id.toString());
                res.body.should.have.property('createdBy').eql(savedUser._id.toString());

                // res.body.should.have.property('messages_count').gt(0);

                res.body.should.have.property('status').eql(200);
                
                // res.body.should.have.property('agents').eql(savedUser._id);
                expect(res.body.snapshot.agents.length).to.equal(1);
                expect(res.body.participants.length).to.equal(1);

                expect(res.body.participantsAgents.length).to.equal(1);                
                expect(res.body.participantsBots).to.have.lengthOf(0);
                expect(res.body.hasBot).to.equal(false);           

                res.body.should.have.property('department').not.eql(null);
                // res.body.should.have.property('lead').eql(undefined);
                            
                console.log("res.body.request_id: "+ res.body.request_id);

                chai.request(server)
                .put('/'+ savedProject._id + '/requests/'+res.body.request_id+"/departments")
                .auth(email, pwd)
                .set('content-type', 'application/json')
                .send({"no_populate":"true"})
                .end(function(err, res2) {
                    //console.log("res",  res);
                    console.log("res.body",  res2.body);
                    res2.should.have.status(200);
                    res2.body.should.be.a('object');
                    expect(res.body.participants.length).to.equal(1);
                    expect(res.body.participantsAgents.length).to.equal(1);
                    expect(res.body.participantsBots.length).to.equal(0);

                  
                    
                    res2.body.requester.should.be.a('string');
                    res2.body.lead.should.be.a('string');
                    // expect(res.body.requester).to.equal(undefined);                
                    // expect(res.body.lead).to.equal(undefined);                

                    done(); 
                });
               
            });
    });
  });
});



// mocha test/requestRoute.js  --grep 'createAndAssign2'

it('createAndAssign2', function (done) {
  // this.timeout(10000);

  var email = "test-request-create-" + Date.now() + "@email.com";
  var pwd = "pwd";

  userService.signup( email ,pwd, "Test Firstname", "Test lastname").then(function(savedUser) {
   projectService.create("request-create", savedUser._id).then(function(savedProject) {
   

        chai.request(server)
          .post('/'+ savedProject._id + '/requests/')
          .auth(email, pwd)
          .set('content-type', 'application/json')
          .send({"text":"first_text"})
          .end(function(err, res) {
              //console.log("res",  res);
              console.log("res.body",  res.body);
              res.should.have.status(200);
              res.body.should.be.a('object');
              
              expect(res.body.snapshot.agents.length).to.equal(1);
              // res.body.should.have.property('request_id').eql('request_id');
              // res.body.should.have.property('requester_id').eql('requester_id');
              res.body.should.have.property('first_text').eql('first_text');
              res.body.should.have.property('id_project').eql(savedProject._id.toString());
              res.body.should.have.property('createdBy').eql(savedUser._id.toString());

              // res.body.should.have.property('messages_count').gt(0);

              res.body.should.have.property('status').eql(200);
              
              // res.body.should.have.property('agents').eql(savedUser._id);
              expect(res.body.snapshot.agents.length).to.equal(1);
              expect(res.body.participants.length).to.equal(1);

              expect(res.body.participantsAgents.length).to.equal(1);                
              expect(res.body.participantsBots).to.have.lengthOf(0);
              expect(res.body.hasBot).to.equal(false);           

              res.body.should.have.property('department').not.eql(null);
              // res.body.should.have.property('lead').eql(undefined);
                          
              console.log("res.body.request_id: "+ res.body.request_id);

              chai.request(server)
              .put('/'+ savedProject._id + '/requests/'+res.body.request_id+"/assign")
              .auth(email, pwd)
              .set('content-type', 'application/json')
              .send({})
              .end(function(err, res2) {
                  //console.log("res",  res);
                  console.log("res.body",  res2.body);
                  res2.should.have.status(200);
                  res2.body.should.be.a('object');
                  expect(res.body.participants.length).to.equal(1);
                  expect(res.body.participantsAgents.length).to.equal(1);
                  expect(res.body.participantsBots.length).to.equal(0);

                
                  
                  res2.body.requester.should.be.a('string');
                  res2.body.lead.should.be.a('string');
                  // expect(res.body.requester).to.equal(undefined);                
                  // expect(res.body.lead).to.equal(undefined);                

                  done(); 
              });
             
          });
  });
});
});

    // it('assign', (done) => {

        
    // //   this.timeout();

    //    var email = "test-signup-" + Date.now() + "@email.com";
    //    var pwd = "pwd";

    //     userService.signup( email ,pwd, "Test Firstname", "Test lastname").then(function(savedUser) {
    //         projectService.create("test-join-member", savedUser._id).then(function(savedProject) {
    //             requestService.createWithId("join-member", "requester_id1", savedProject._id, "first_text").then(function(savedRequest) {

    //                 var webhookContent =     { "assignee": 'assignee-member'}
                        
            
    //                 chai.request(server)
    //                     .post('/'+ savedProject._id + '/requests/' + savedRequest.request_id + '/assign')
    //                     .auth(email, pwd)
    //                     .send(webhookContent)
    //                     .end((err, res) => {
    //                         //console.log("res",  res);
    //                         console.log("res.body",  res.body);
    //                         res.should.have.status(200);
    //                         res.body.should.be.a('object');
    //                         // res.body.should.have.property('status').eql(200);
                            

    //                         // res.body.should.have.property('participants').to.have.lengthOf(2);
    //                         // res.body.should.have.property('participants').contains("agentid1");
    //                         // res.body.should.have.property('participants').contains(savedUser._id);
                        
    //                         done();
    //                     });

                        
    //             });
    //             });
    //             });
    // }).timeout(20000);








});

});


