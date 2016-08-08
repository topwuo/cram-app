/**
 * Created by kylefang on 4/28/16.
 * @flow
 */

'use strict';
//Currently using it as playground

import React, {Component} from 'react';
import {connect} from 'react-redux';
import {openDrawer} from '../../actions/drawer';
import {popRoute, replaceRoute ,pushNewRoute} from '../../actions/route';
// import CodePush from 'react-native-code-push';
import { Image, View, VibrationIOS, ScrollView,InteractionManager} from 'react-native';
import {Container, Header, Title, Content, Text, Button, Icon, List, ListItem, Footer, Card, CardItem, Thumbnail} from 'native-base';
import FooterComponent from "./../footer";

import theme from '../../themes/base-theme';
import scanner from './scanner-theme';
import styles from './styles';
import Camera from 'react-native-camera';
import Modal from 'react-native-modalbox';
import Overlay from 'react-native-overlay';
import { Col, Row, Grid } from "react-native-easy-grid";

import global_variables from '../../global_variables';
import realm_schema from '../../realm_schema';

const {Klass}        = require('NativeModules');
const {Teacher}      = require('NativeModules');
const {Attendance}   = require('NativeModules');
const {User}         = require('NativeModules');
const {Course}       = require('NativeModules');
const {Student}      = require('NativeModules');
const {Notification} = require('NativeModules');
const Realm          = require('realm');

class Scanner extends Component {
  constructor(props){
     super(props);
     this.onBarCodeRead    = this.onBarCodeRead.bind(this);
     this.openStudentModalAlpha = this.openStudentModalAlpha.bind(this);
     this.closeStudentModalAlpha = this.closeStudentModalAlpha.bind(this);
     this.openStudentModalBeta = this.openStudentModalBeta.bind(this);
     this.closeStudentModalBeta = this.closeStudentModalBeta.bind(this);
     this.convertTimestamp = this.convertTimestamp.bind(this);
     this.barCodeData = "";
     this.state = {
       swipeToClose: true,
       name: '',
       status: '',
       arrived_at: '',
       profileImage: '',
       isOpenStudentModalAlpha: false,
       isOpenStudentModalBeta: false,
       studentModalStyleAlpha: styles.student_card_white,
       studentModalStyleAlpha: styles.student_card_white,
       };
    }

    pushNewRoute(route) {
         this.props.pushNewRoute(route);
    }

    // synchronize front/backend DB here.. call ALL 'GET APIs'
    componentWillMount () {

        console.log('path = ' + Realm.defaultPath);

        //  let realm = new Realm({schema: [realm_schema.UserModel, realm_schema.NotificationModel, realm_schema.StudentModel, realm_schema.CourseModel, realm_schema.AttendanceModel, realm_schema.KlassModel]});
        let realm = new Realm({schema: realm_schema});
         // get user access token
         var users = realm.objects('UserModel').sorted('i_login_at', true);
         var access_token = users[users.length-1].s_access_token;

         InteractionManager.runAfterInteractions(() => {
           // perform api calls
           User.getInfo(global_variables.HOST + '/api/v1/me?access_token=' + access_token,
             function successCallback(results) {
             },
             function errorCallback(results) {
               alert(results.msg);
             });

            Student.getInfo(global_variables.HOST + '/api/v1/students?access_token=' + access_token,
              function successCallback(results) {
              },
              function errorCallback(results) {
                alert(results.msg);
              });

            Course.getInfo(global_variables.HOST + '/api/v1/courses?access_token=' + access_token,
              function successCallback(results) {
              },
              function errorCallback(results) {
                alert(results.msg);
              });

            // change this hard codes course id later...
            Course.getStudentList('e327424d-d456-488e-9b14-35e488c34c14', global_variables.HOST + '/api/v1/students?access_token=' + access_token,
              function successCallback(results) {
              },
              function errorCallback(results) {
                alert(results.msg);
              });

            Notification.getInfo(global_variables.HOST + '/api/v1/notifications?access_token=' + access_token,
              function successCallback(results) {
              },
              function errorCallback(results) {
                alert(results.msg);
              });

            Attendance.getInfo(global_variables.HOST + '/api/v1/attendances?access_token=' + access_token,
              function successCallback(results) {
              },
              function errorCallback(results) {
                alert(results.msg);
              });

            Klass.getInfo(global_variables.HOST + '/api/v1/classes?access_token=' + access_token,
              function successCallback(results) {
              },
              function errorCallback(results) {
                alert(results.msg);
              });
          });
    }

    openStudentModalAlpha() {
        VibrationIOS.vibrate();
        this.refs.student_modal_alpha.open();
    }

    closeStudentModalAlpha() {
        this.refs.student_modal_alpha.close();
        //this.pushNewRoute('scannerOverlay');
    }

    openStudentModalBeta() {
        VibrationIOS.vibrate();
        this.refs.student_modal_beta.open();
    }

    closeStudentModalBeta() {
        this.refs.student_modal_beta.close();
        //this.pushNewRoute('scannerOverlay');
    }


    replaceRoute(route) {
        this.props.replaceRoute(route);
    }

    popRoute() {
        this.props.popRoute();
    }

    onBarCodeRead(result) {

      if (this.barCodeData != null && this.barCodeData != result.data) {
        this.barCodeData = result.data;
          let realm = new Realm({schema: realm_schema});
          // get user access token
          var users = realm.objects('UserModel').sorted('i_login_at', true);
          var current_user = users[users.length-1];
          var access_token = current_user.s_access_token;

          realm.write(() => {
            current_user.i_scannerUsage += 1;
          });

          // // check if scanned qr code is student's qrcode
          // var students = realm.objects('StudentModel');
          // // if not student qr code, don't call API
          // if(!$this.isStudentQrCode(students, $this.barCodeData)){
          //   clearInterval(Id);
          //   alert('not student qr code. ' + $this.barCodeData);
          //   return;
          // }

          var $this = this;

          Teacher.checkIn($this.barCodeData, 'scan_qr_code', global_variables.HOST + '/api/v1/attendances/checkin?access_token=' + access_token,
            function successCallback(results) {

              let realm = new Realm({schema: realm_schema});

              // set student info state for student arrival modal
              var studentModel = realm.objects('StudentModel').filtered('s_qr_code_id = "' + $this.barCodeData + '"')[0];
              $this.setState({name: studentModel.s_name});

              var models = realm.objects('AttendanceModel').filtered('s_student_id = "' + studentModel.s_student_id + '"').sorted('i_arrived_at');
              var attendanceModel = models[models.length-1];

               // switch status to specific chinese words
              if(attendanceModel.s_status == 'arrived')
              {
                $this.setState({status: '抵達'});
              }

              // split datetime string to "time"
              var arrived_at = $this.convertTimestamp(attendanceModel.i_arrived_at);
              arrived_at = arrived_at.split(",")[1];
              $this.setState({arrived_at: arrived_at});

              // check if first time to open student modal
              if($this.state.isOpenStudentModalAlpha == false && $this.state.isOpenStudentModalBeta == false)
              {
                //alert('first');
                $this.setState({isOpenStudentModalAlpha: true});
                $this.openStudentModalAlpha();
              }
              // Alpha Modal = Current Modal
              else if($this.state.isOpenStudentModalAlpha == true)
              {
                //alert('Alpha');
                //$this.setState({studentModalStyleAlpha: styles.student_card_gray});
                $this.closeStudentModalAlpha();
                setTimeout(function() {$this.openStudentModalBeta()},200);
                $this.setState({isOpenStudentModalBeta: true});
                $this.setState({isOpenStudentModalAlpha: false});
                setTimeout(function() {

                  $this.setState({studentModalStyleAlpha: styles.student_card_white});
                }, 500);
              }
              // Beta Modal = Next Modal
              else if($this.state.isOpenStudentModalBeta == true)
              {
                //alert('Beta');
                //$this.setState({studentModalStyleBeta: styles.student_card_gray});
                $this.closeStudentModalBeta();
                setTimeout(function() {$this.openStudentModalAlpha();},200);
                $this.setState({isOpenStudentModalAlpha: true});
                $this.setState({isOpenStudentModalBeta: false});
                setTimeout(function() {
                  $this.setState({studentModalStyleBeta: styles.student_card_white});
                }, 500);
              }
              //alert(studentModel.s_name + ' ' + attendanceModel.s_status + ' at ' + arrived_at);
            },
            function errorCallback(results) {
              alert('qr code is not a student qr code. This qr code is: ' + $this.barCodeData)
            });
      } // end of if qr code dupe check
    } // end of onBarCodeRead()

    convertTimestamp(timestamp) {
      var d = new Date(timestamp * 1000),	// Convert the passed timestamp to milliseconds
      		yyyy = d.getFullYear(),
      		mm = ('0' + (d.getMonth() + 1)).slice(-2),	// Months are zero based. Add leading 0.
      		dd = ('0' + d.getDate()).slice(-2),			// Add leading 0.
      		hh = d.getHours(),
      		h = hh,
      		min = ('0' + d.getMinutes()).slice(-2),		// Add leading 0.
      		ampm = 'AM',
      		time;
      if (hh > 12) {
      		h = hh - 12;
      		ampm = 'PM';
      	} else if (hh === 12) {
      		h = 12;
      		ampm = 'PM';
      	} else if (hh == 0) {
      		h = 12;
      	}
        // ie: 2013-02-18, 8:35 AM
      	time = yyyy + '-' + mm + '-' + dd + ', ' + h + ':' + min + ' ' + ampm;
      return time;
    }


    // isStudentQrCode(students, barCodeData){
    //   var studentQrCode = false;
    //
    //   for (var i = 0; i < students.length; i++){
    //     console.log('students= ' + students[i].s_student_qrCode + ', barcodedata= '+ barCodeData);
    //     if(students[i].s_student_qrCode == barCodeData){
    //       studentQrCode = true;
    //     }
    //   }
    //
    //   return studentQrCode;
    // }

    render() {
      this.barCodeFlag = true;
        return (
                  <View>
                    <Header style={{backgroundColor:'#f5f6f7'}}>
                      <Button
                        transparent
                        onPress={this.props.openDrawer}>
                        <Image source={require('../../../images/menu/btn_menu.png')}/>
                      </Button>
                      <Image style={{alignSelf:'center'}}source={require('../../../images/scanner/ic_tmot_scan.png')}/>
                       <Button
                         transparent
                         onPress={() => this.replaceRoute('notifications')}>
                         <Image source={require('../../../images/notification/btn_notification.png')}/>
                       </Button>
                    </Header>
                    <Camera
                      onBarCodeRead={this.onBarCodeRead}
                      style={styles.camera}>
                      <View style={styles.rectangleContainer}>
                        <View style={styles.markerTop}>
                          <Image
                          source={require('../../../images/marker/qrcodescannermarker.png')}
                          style={styles.markerTopLeft}>
                        </Image>
                        <Image
                        source={require('../../../images/marker/qrcodescannermarker.png')}
                        style={styles.markerTopRight}>
                      </Image>
                    </View>
                    <View style={styles.markerBottom}>
                      <Image
                      source={require('../../../images/marker/qrcodescannermarker.png')}
                      style={styles.markerBottomLeft}>
                    </Image>
                    <Image
                    source={require('../../../images/marker/qrcodescannermarker.png')}
                    style={styles.markerBottomRight}>
                  </Image>
                </View>
              </View>
              <Modal style={styles.student_modal} backdrop={false} ref={"class_modal"} swipeToClose={true} position="bottom" entry="bottom">
                  <Card style={styles.space}>
                      <Text style={styles.modalTitleCh}>兒童英文初級對話</Text>
                      <View style={{flexDirection:'row',paddingTop:20}}>
                        <CardItem padder>
                                  <Text style={styles.arriveTxtCh}>抵達</Text>
                                  <Text style={styles.arriveNum}>3</Text>
                        </CardItem>
                        <CardItem padder>
                                  <Text style={styles.abscenceTxtCh}>請假</Text>
                                  <Text style={styles.abscenceNum}>2</Text>
                        </CardItem>
                        <CardItem padder>
                                  <Text style={styles.leaveTxtCh}>未到</Text>
                                  <Text style={styles.leaveNum}>17</Text>
                        </CardItem>
                      </View>
                      <Button rounded style={styles.btn} onPress={this.closeStudentModalBeta.bind(this)} >
                        <Text style={styles.btnTxtCh}>未到名單</Text>
                      </Button>
                  </Card>
              </Modal>
            <Modal style={styles.student_modal} backdrop={false} ref={"student_modal_alpha"} swipeToClose={false} position="bottom" entry="bottom">
                <Card style={this.state.studentModalStyleAlpha}>
                    <View style={{flexDirection:'row',paddingTop:20}}>
                      <Thumbnail size={135} style={{alignSelf: 'center', marginLeft:20 ,marginTop: 20, marginBottom: 15, resizeMode: 'contain'}} circular source={require('../../../images/contacts/atul.png')} />
                      <View style={{flexDirection:'column'}}>
                        <Button transparent><Text style={styles.studentModalName}>{this.state.name}</Text></Button>
                        <Text style={styles.studentModalStatus}>{this.state.status}</Text>
                        <Text style={styles.studentModalArrivalTime}>{this.state.arrived_at}</Text>
                      </View>
                    </View>
                </Card>
            </Modal>
            <Modal style={styles.student_modal} backdrop={false} ref={"student_modal_beta"} swipeToClose={false} position="bottom" entry="bottom">
                <Card style={this.state.studentModalStyleBeta}>
                    <View style={{flexDirection:'row',paddingTop:20}}>
                      <Thumbnail size={135} style={{alignSelf: 'center', marginLeft:20 ,marginTop: 20, marginBottom: 15, resizeMode: 'contain'}} circular source={require('../../../images/contacts/atul.png')} />
                      <View style={{flexDirection:'column'}}>
                        <Button transparent><Text style={styles.studentModalName}>{this.state.name}</Text></Button>
                        <Text style={styles.studentModalStatus}>{this.state.status}</Text>
                        <Text style={styles.studentModalArrivalTime}>{this.state.arrived_at}</Text>
                      </View>
                    </View>
                </Card>
            </Modal>
            </Camera>
          </View>
        )
    }
}

function bindAction(dispatch) {
    return {
        openDrawer: ()=>dispatch(openDrawer()),
        pushNewRoute:(route)=>dispatch(pushNewRoute(route)),
        popRoute: ()=> dispatch(popRoute()),
        replaceRoute:(route)=>dispatch(replaceRoute(route))
    }
}

export default connect(null, bindAction)(Scanner);
