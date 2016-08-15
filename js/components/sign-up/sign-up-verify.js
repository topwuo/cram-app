/**
 * Created by kylefang on 4/28/16.
 * @flow
 */

'use strict';
//Currently using it as playground

import React, {Component} from 'react';
import {connect} from 'react-redux';
// import CodePush from 'react-native-code-push';
import { Image ,TextInput, Dimensions, DeviceEventEmitter, Keyboard } from 'react-native';
import {pushNewRoute,popRoute} from '../../actions/route';
import {replaceOrPushRoute} from '../../actions/route';
import {Container, Header, Title, Content, Text, Button, Icon, InputGroup, Input, View } from 'native-base';
import theme from '../../themes/base-theme';
import global_variables from '../../global_variables';
import realm_schema from '../../realm_schema';
import styles from './styles';
import signup from './signup-theme';

const Realm = require('realm');
const {User} = require('NativeModules');

class SignUpVerify extends Component {

  constructor(props) {
      super(props);
      this.state = {
          code: '',
          newHeight:0
      };
      this.onNextPressed = this.onNextPressed.bind(this);
  }

  componentWillMount () {
      Keyboard.addListener('keyboardWillShow', this.keyboardWillShow.bind(this));
      Keyboard.addListener('keyboardWillHide', this.keyboardWillHide.bind(this));
  }

  keyboardWillShow (e) {
      let newSize = Dimensions.get('window').height - e.endCoordinates.height;
      this.setState({newHeight: newSize});
  }

  keyboardWillHide (e) {
      this.setState({newHeight: 0});
  }


    popRoute() {
        this.props.popRoute();
    }

    navigateTo(route) {
       this.props.replaceOrPushRoute(route);
    }

    onNextPressed(){
      var $this = this;
      // Create Realm
      let realm = new Realm({schema: realm_schema});
      // get realm object
      let people = realm.objects('People');
      let person = people[people.length - 1];

      User.checkVerificationCode(this.state.code, global_variables.HOST+'/api/v1/signup/check_verification_code',
       function successCallback(results) {

          $this.props.pushNewRoute('edit');
          //  $this.props.pushNewRoute('signUpCreate');

          realm.write(() => {
            person.s_verificationCode = $this.state.code;
          });
       },
       function errorCallback(results) {
           alert(results.msg);
       });
      //  console.log(Realm.defaultPath);
      //this.props.pushNewRoute('signUpCreate');
    }

    render() {
        return (
          <View style={{flex:1,backgroundColor:'#f5f6f7'}}>
            <Button transparent style={{marginTop:theme.headerBtnMarginTop}} onPress={() => this.popRoute()}>
              <Image source={require('../../../images/button/btn_back.png')}/>
            </Button>
            <Content
              theme={signup}
              style={{backgroundColor: '#f5f6f7',marginTop: -(this.state.newHeight/3)}}
              scrollEnabled={this.state.scroll}>
              <Image source={require('../../../images/tmot_logo/ic_tmot_logo.png')} style={{alignSelf:'center',marginTop:105}} />
              <Text style={styles.newAccountTxt}>創建新帳號</Text>
              <View style={styles.bg}>
                <View style={styles.mb20}>
                    <Input placeholder="驗證碼" onChangeText={(code) => this.setState({code})} value={this.state.code} />
                    <Text>{this.state.client_error_msg}</Text>
                  </View>
                  <Button transparent rounded style={styles.getVerifyBtn} onPress={this.onNextPressed}>
                    <View>
                      <Text style={styles.verifyTxt}>驗證驗證碼</Text>
                    </View>
                  </Button>
              </View>
            </Content>
          </View>
        )
    }
}

function bindAction(dispatch) {
    return {
        popRoute: () => dispatch(popRoute()),
        replaceOrPushRoute:(route)=>dispatch(replaceOrPushRoute(route)),
        pushNewRoute:(route)=>dispatch(pushNewRoute(route))
    }
}

export default connect(null, bindAction)(SignUpVerify);
