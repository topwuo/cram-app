//
//  MySwiftThingy.swift
//  CramSchoolLibrary
//
//  Created by Robert Shapiro on 7/4/16.
//  Copyright © 2016 Facebook. All rights reserved.
//

import Foundation
import RealmSwift

@objc(User)
class User: NSObject {
  
  // MARK: SIGN UP FUNCTIONS
  
  // get user's verification code
  @objc func getUserVerificationCode(phone: String, url: String, successCallBack: RCTResponseSenderBlock, failureCallBack: RCTResponseSenderBlock) -> Void {
    
    
    let code = UserTestFunctions.createVerificationCodeWithPhoneNumber(phone)
    var result = ["success" : "true"]
    result["verificationCode"] = code
    
    successCallBack([result])
    
    
//    // return verification code in callback
//    GetApi.getVerificationCode(phone, url: url,
//                       
//      // SuccessBlock (parse response to realm object)
//      successBlock: { (response) in
//        
//        // return true if get person info success
//        var result = ["success" : "true"];
//        result["verificationCode"] = (response["verificationCode"] as! String)
//        
//        successCallBack([result])
//      },
//      
//      // FailureBlock (print the error message from server)
//      failureBlock: { (response) in
//        
//        // return false if get person info failed
//        let result = ["success" : false];
//        
//        failureCallBack([result])
//    })

    
  }
  
  // check user's verification code
  @objc func checkUserVerificationCode(phone: String, verificationCode: String, url: String, successCallBack: RCTResponseSenderBlock, failureCallBack: RCTResponseSenderBlock) -> Void {

    
    let valid = UserTestFunctions.checkVerificationCodeWithPhoneNumber(phone, verificationCode: verificationCode)
    var result = ["success" : "true"]
    result["valid"] = valid.description
    
    successCallBack([result])

    
    
//    // return result in callback
//    PostApi.checkVerificationCode(phone, verificationCode: verificationCode, url: url,
//                               
//      // SuccessBlock (parse response to realm object)
//      successBlock: { (response) in
//        
//        // return true if get person info success
//        let result = ["success" : true];
//        
//        successCallBack([result])
//      },
//      
//      // FailureBlock (print the error message from server)
//      failureBlock: { (response) in
//        
//        // return false if get person info failed
//        let result = ["success" : false];
//        
//        failureCallBack([result])
//    })

  }
  
  // check username if valid
  @objc func checkUsername(username: String, url: String, successCallBack: RCTResponseSenderBlock, failureCallBack: RCTResponseSenderBlock) -> Void {
    
    let valid = UserTestFunctions.checkUsername(username)
    var result = ["success" : "true"]
    result["valid"] = valid.description
    
    successCallBack([result])
    
    
//    // return result in callback
//    PostApi.checkUsername(username, url: url,
//                                  
//      // SuccessBlock (parse response to realm object)
//      successBlock: { (response) in
//        
//        // return true if get person info success
//        let result = ["success" : true];
//        
//        successCallBack([result])
//      },
//      
//      // FailureBlock (print the error message from server)
//      failureBlock: { (response) in
//        
//        // return false if get person info failed
//        let result = ["success" : false];
//        
//        failureCallBack([result])
//    })

  }
  
  
  
  // create user
  @objc func createUser(userInfo: Dictionary<String, AnyObject>, url: String, successCallBack: RCTResponseSenderBlock, failureCallBack: RCTResponseSenderBlock) -> Void {

    
    UserTestFunctions.createUser(userInfo)
    let result = ["success" : "true"]
    successCallBack([result])

    
//    PostApi.createUser(userInfo, url: url,
//                         
//      // SuccessBlock (parse response to realm object)
//      successBlock: { (response) in
//        
//        let userModel = UserModel.toRealmObject(response)
//        self.saveToRealm(userModel)
//        
//        // return true if get person info success
//        let result = ["success" : true];
//        
//        successCallBack([result])
//      },
//      
//      // FailureBlock (print the error message from server)
//      failureBlock: { (response) in
//        
//        // return false if get person info failed
//        let result = ["success" : false];
//        
//        failureCallBack([result])
//    })
    
  } // end of createUser()
  
  // activate invitation code
  @objc func activateInvitationCode(invitationCode: String, url: String, successCallBack: RCTResponseSenderBlock, failureCallBack: RCTResponseSenderBlock) -> Void {

    let result = ["success" : "true"]
    successCallBack([result])

    
    
//    // return result in callback
//    PostApi.activateInvitationCode(invitationCode, url: url,
//                                  
//      // SuccessBlock (parse response to realm object)
//      successBlock: { (response) in
//        
//        // return true if get person info success
//        let result = ["success" : true];
//        
//        successCallBack([result])
//      },
//      
//      // FailureBlock (print the error message from server)
//      failureBlock: { (response) in
//        
//        // return false if get person info failed
//        let result = ["success" : false];
//        
//        failureCallBack([result])
//    })

    
  }
  
  // get user permission
  @objc func getUserPermission(invitationCode: String, url: String, successCallBack: RCTResponseSenderBlock, failureCallBack: RCTResponseSenderBlock) -> Void {
    
    // save user permissions in realm, and return result in callback
    GetApi.getUserPermission(invitationCode, url: url,
                                  
      // SuccessBlock (parse response to realm object)
      successBlock: { (response) in
        
        let user_id = Int(response["verificationCode"] as! String)
        
        let realm = try! Realm()
        let user = realm.objects(UserModel.self).filter("i_user_id = " + String(user_id)).first
        
        // if there is new data, use it, or else, use the old data
        try! realm.write{
        
          let permission = response["permission"] as! String
          
          user!.s_permission = permission ?? user!.s_permission
        }
        self.saveToRealm(user!)
        
        // return true if get person info success
        let result = ["success" : true];
        
        successCallBack([result])
      },
      
      // FailureBlock (print the error message from server)
      failureBlock: { (response) in
        
        // return false if get person info failed
        let result = ["success" : false];
        
        failureCallBack([result])
    })

  }
  
  
  // update user in realm
  @objc func updateUserInRealm(user_id: Int, name: String?, phone: String?, email: String?) -> Void{
    
    let realm = try! Realm()
    let userModel = realm.objects(UserModel.self).filter("i_user_id = " + String(user_id)).first
    
    // if there is new data, use it, or else, use the old data
    
    try! realm.write{
      
      userModel!.s_name       = name  ?? userModel!.s_name
      userModel!.s_phone      = phone ?? userModel!.s_phone
      userModel!.s_email      = email ?? userModel!.s_email
    }
    saveToRealm(userModel!)
    
  } // end of updatePersonInRealm()
  
  
  
  // update user info in server
  @objc func updateUserInServer(id: Int, url: String, successCallBack: RCTResponseSenderBlock, failureCallBack: RCTResponseSenderBlock) -> Void {
    
    PutApi.updateUser(id, url: url,
                        
                        // SuccessBlock (parse response to realm object)
      successBlock: { (response) in
        
        // return true if get person info success
        let result = ["success" : true];
        
        successCallBack([result])
      },
      
      // FailureBlock (print the error message from server)
      failureBlock: {
        (response) in
        print(response)
        
        // return false if get person info failed
        let result = ["success" : false];
        
        failureCallBack([result])
    })
    
  } // end of updatePersonInServer()
  
  
  // MARK: LOGIN FUNCTIONS
  
  // login
  @objc func login(username: String, password: String, url: String, successCallBack: RCTResponseSenderBlock, failureCallBack: RCTResponseSenderBlock) -> Void {

    
    let realm = try! Realm()
    let testUser = realm.objects(TestUser.self).filter("s_username = " + String(username)).first
    
    var result = ["success" : "true"]
    
    if testUser?.s_password == password{
      result["valid"] = "true"
    }
    else{
      result["valid"] = "false"
    }
    
    
    successCallBack([result])

    
//    PostApi.login(username, password: password, url: url,
//                      
//      // SuccessBlock (parse response to realm object)
//      successBlock: { (response) in
//        
//        // return true if get person info success
//        let result = ["success" : true];
//        
//        successCallBack([result])
//      },
//      
//      // FailureBlock (print the error message from server)
//      failureBlock: {
//        (response) in
//        print(response)
//        
//        // return false if get person info failed
//        let result = ["success" : false];
//        
//        failureCallBack([result])
//    })
    
  } // end of updatePersonInServer()
  
  
  
  
  @objc func callbackMethod(callback: RCTResponseSenderBlock) -> Void {
    
    let resultsDict = [
      "success" : true
    ];
    
    callback([NSNull() ,resultsDict])
    
  }
  
  @objc func simpleMethod(message: String!) {
    
    let documentPath = NSSearchPathForDirectoriesInDomains(.DocumentDirectory, .UserDomainMask, true)[0]
    print(documentPath)
    
  }
  
  
  // private methods just for swift
  func saveToRealm(realmObject: Object){
    
    let realm = try! Realm()
    try! realm.write({
      realm.add(realmObject, update: true)
    })
  }
  
  func getNextLocalId() -> Int{
    
    let realm = try! Realm()
    
    return realm.objects(UserModel.self).count + 1
  }
  
  
}