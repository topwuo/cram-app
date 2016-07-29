/**
 * Created by kylefang on 4/28/16.
 * @flow
 */

'use strict';
//Currently using it as playground

import React, {Component} from 'react';
import {connect} from 'react-redux';
import Spinner from './../loaders/Spinner';
// import CodePush from 'react-native-code-push';
import {ScrollView, Image,TextInput,DeviceEventEmitter, Dimensions, Platform, Keyboard } from 'react-native';
import {popRoute} from '../../actions/route';
import {closeDrawer} from '../../actions/drawer';
import {pushNewRoute, replaceOrPushRoute} from '../../actions/route';
import {Container, Header, Title, Content, Text, Button, Icon, InputGroup, Input, View } from 'native-base';
import theme from '../../themes/base-theme';
import styles from './styles';
import login from './login-theme';
import global_variables from '../../global_variables';
import realm_schema from '../../realm_schema';


const {User} = require('NativeModules');
const Realm = require('realm');

class LoginEmail extends Component {
  constructor(props) {
      super(props);
      this.onNextPressed = this.onNextPressed.bind(this);
      this.state = {
          email: '',
          password: '',
          newHeight: 0
      };
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

    pushNewRoute(route) {
         this.props.pushNewRoute(route);
    }
    navigateTo(route) {
        this.props.replaceOrPushRoute(route);
    }

    // next button tapped
    onNextPressed(){

      var $this = this;

      User.login(this.state.email, this.state.password, 'password', global_variables.HOST+'/oauth/token',
       function successCallback(results) {

         global_variables.email = $this.state.email
         // navigate to scanner page
          $this.navigateTo('scanner');
       },
       function errorCallback(results) {
           alert(results.msg);
       });

    }

    render() {
      console.log(Realm.defaultPath);

        return (
            <View style={{flex:1,backgroundColor:'#f5f6f7'}}>
                <Button transparent style={{marginTop:theme.headerBtnMarginTop}} onPress={() => this.popRoute()}>
                  <Image source={require('../../../images/button/btn_back.png')}/>
                </Button>
                <Content theme={login} padder style={{backgroundColor: 'transparent',marginTop:-(this.state.newHeight/3)}} scrollEnabled={true}>
                  <Image source={require('../../../images/tmot_logo/ic_tmot_logo.png')} style={{alignSelf:'center',marginTop:105}} />
                  <Text style={styles.phoneLoginTitle}>電子信箱登入</Text>
                    <View padder>
                        <View style={styles.mb20}>
                            <Input placeholder="電子信箱" style={styles.generalChineseTxt} onChangeText={(email) => this.setState({email})} value={this.state.email}/>
                        </View>
                        <View style={styles.mb20}>
                            <Input placeholder="密碼" style={styles.generalChineseTxt} onChangeText={(password) => this.setState({password})} value={this.state.password}/>
                        </View>
                        <Button rounded style={styles.phoneBtn} onPress={this.onNextPressed}>
                            <Text style={styles.phoneLoginTxt}>確定</Text>
                        </Button>
                    </View>
                </Content>
            </View>
        )
    }
}

// <Spinner color='#ff6100'/>

function bindAction(dispatch) {
    return {
        popRoute: () => dispatch(popRoute()),
        replaceOrPushRoute:(route)=>dispatch(replaceOrPushRoute(route)),
        pushNewRoute:(route)=>dispatch(pushNewRoute(route))
    }
}

export default connect(null, bindAction)(LoginEmail);
