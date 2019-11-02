import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  StatusBar,
  Image,
  ScrollView,
  ActivityIndicator,
  PermissionsAndroid,
  Alert,
} from 'react-native';

var RNFS = require('react-native-fs');

import RNFetchBlob from 'rn-fetch-blob';

import Modal from 'react-native-modal';

import * as Progress from 'react-native-progress';

var host = 'https://api-testtube.herokuapp.com/';

export default class Search extends React.Component {
  state = {
    query: '',
    videos: [],
    Links: [],
    showList: false,
    isLargeLoadingOn: false,
    isSmallLoadingOn: false,
    isModalVisible: false,
    showBar: false,
    progress: '',
  };

  toggleModal = () => {
    this.setState({isModalVisible: !this.state.isModalVisible});
  };
  
  toggleBar = () =>{
    this.setState({showBar: !this.state.showBar});
  }

  async downloadFile(link, title) {
    this.toggleBar();
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        this.getFile(link, title);
      } else {
        Alert.alert(
          'Permission Denied!',
          'You need to give storage permission to download the file',
        );
      }
    } catch (err) {
      console.warn(err);
    }
  }

  getResult = () => {
    var endPoint = 'search?q=';
    this.setState({isLargeLoadingOn: true, showList: true});
    fetch(host + endPoint + this.state.query)
      .then(response => response.json())
      .then(result => this.setState({isLargeLoadingOn: false, videos: result}));
  };

  getFile = (link, title) => {
    const dir = '/storage/emulated/0/TestTube/Downloaded/';

    // RNFetchBlob.fs
    //   .exists(dir)
    //   .then()
    //   .catch(() => {
    //     RNFetchBlob.fs.mkdir(dir);
    //   });

    // RNFetchBlob.fetch('GET', link).progress((received, total) => {
    //   this.setState({
    //     progress: Math.floor((received / total) * 100),
    //   });
    // });

  //  RNFS.mkdir( RNFS.DocumentDirectoryPath + '/Downloaded')

RNFS.downloadFile({
  fromUrl:link,
  toFile:dir + title + ".mp3",
  progress :(data) => this.downloadFileProgress(data),
}).promise.then(e => console.log(e));

}
  downloadFileProgress = (data) =>{
    const percentage = ((100 * data.bytesWritten) / data.contentLength) | 0;
    const text = `Progress ${percentage}%`;
    this.setState({
          progress:percentage,
        });
        console.log(text);
    };

  convertToSlug = Text => {
    return Text.toLowerCase()
      .replace(/ /g, '-')
      .replace(/[^\w-]+/g, '');
  };

  getLinks = videoId => {
    this.toggleModal();
    this.setState({isSmallLoadingOn: true});
    var endPoint = 'download?id=';
    fetch(host + endPoint + videoId)
      .then(response => response.json())
      .then(result => this.setState({Links: result, isSmallLoadingOn: false}));
  };

  render() {
    return (
      <View style={style.container}>
        <View style={style.wrapper}>
          <TextInput
            style={style.searchBox}
            placeholder="Search song here"
            onChangeText={text => this.setState({query: text})}
            value={this.state.query}></TextInput>

          <TouchableOpacity style={style.searchButton} onPress={this.getResult}>
            <Text>Search</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          contentContainerStyle={{flexGrow: 1}}
          showsVerticalScrollIndicator={false}>
          {this.state.showList ? (
            <View>
              {this.state.isLargeLoadingOn ? (
                <ActivityIndicator size="large" color="#192a56" />
              ) : (
                <View>
                  <Text style={{fontWeight: 'bold', fontSize: 26}}>
                    Results:
                  </Text>
                  {this.state.videos.map(item => {
                    return (
                      <View style={style.listItem}>
                        <TouchableOpacity
                          onPress={() =>
                            this.getLinks(item.id.replace('/watch?v=', ''))
                          }>
                          <Image
                            style={{width: 70, height: 70, borderRadius: 5}}
                            source={{uri: item.img}}
                          />
                          <Text>{item.title}</Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                  <Modal
                    isVisible={this.state.isModalVisible}
                    style={{flex: 1}}
                    onBackdropPress={() =>
                      this.setState({isModalVisible: false})
                    }>
                    <View style={style.modal}>
                      {this.state.isSmallLoadingOn ? (
                        <ActivityIndicator size="large" color="#192a56" />
                      ) : (
                        <View style={{alignItems: 'center'}}>
                          <Text style={{color: '#ff4757'}}>
                            Click any of the follwing link:
                          </Text>

                          {this.state.showBar ? (
                            <Progress.Bar progress={this.state.progress/100} width={300} />
                          ) : null}
                          {this.state.Links.map((item, index) => {
                            return (
                              <TouchableOpacity
                                style={style.downloadButton}
                                onPress={() =>
                                  this.downloadFile(item.link, item.title)
                                }>
                                <Text style={{color: '#273c75'}}>
                                  {item.itag === '251' ? '160KBPS' : '128KBPS'}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      )}
                    </View>
                  </Modal>
                </View>
              )}
            </View>
          ) : null}
        </ScrollView>
      </View>
    );
  }
}

var style = StyleSheet.create({
  container: {
    flex: 1,
    margin: StatusBar.currentHeight * 1,
    fontFamily: 'Roboto',
  },
  wrapper: {
    alignItems: 'flex-start',
    justifyContent: 'space-around',
    flexDirection: 'row',
    padding: 15,
  },
  listItem: {
    margin: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 9,
    },
    shadowOpacity: 0.5,
    shadowRadius: 12.35,
    elevation: 19,
  },
  searchBox: {
    marginLeft: 10,
    height: 40,
    borderColor: '#2ecc71',
    borderWidth: 2,
    width: '60%',
    borderRadius: 10,
    padding: 10,
  },
  searchButton: {
    borderColor: '#2ecc71',
    borderWidth: 1,
    backgroundColor: '#2ecc71',
    borderRadius: 5,
    textAlign: 'center',
    padding: 10,
    color: 'red',
  },
  modal: {
    flex: 0.3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 2,
  },
  downloadButton: {
    backgroundColor: '#2ecc71',
    padding: 10,
    margin: 10,
    borderRadius: 4,
  },
});
