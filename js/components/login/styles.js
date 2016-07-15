/* @flow */
'use strict';

var React = require('react-native');

var { StyleSheet, Dimensions } = React;

var deviceHeight = Dimensions.get('window').height;

module.exports = StyleSheet.create({
    container: {
        flex: 1,
        width: null,
        height: null,
    },
    shadow: {
        flex: 1,
        width: null,
        height: null,
        backgroundColor: 'transparent'
    },
    bg: {
        flex: 1,
        marginTop: (deviceHeight/2)-15,
        paddingTop: 20,
        paddingLeft: 20,
        paddingRight: 20,
        paddingBottom: 70
    },
    mb20: {
      flexDirection:'row',
      alignItems:'center',
      backgroundColor:'#eaebed',
      marginTop: 20,
      marginBottom: 20,
      borderRadius: 7
    },
    btn: {
      alignSelf:'center',
      backgroundColor: '#bfbfc1',
      margin: 10
    },
    txt: {
      color:'black',
      justifyContent:'center',
      fontSize: 15,
      marginBottom:12
    }

});
