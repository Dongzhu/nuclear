import React from 'react';
import Sound from 'react-sound';

import Navbar from '../components/navbar.component';
import NowPlaying from '../components/nowplaying.component';
import Player from '../components/player.component';
import SongList from '../components/songlist.component';
import Tools from '../components/tools.components';
import ToolsContainer from '../containers/tools.container';


class AppContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      songList: [],
      playQueue: [],
      playStatus: Sound.status.STOPPED,
      songListLoading: false,
      nowPlayingLoading: false,
      songProgress: 0.0
    };
  }

  fetchSongStreamUrl(song, callback){
    if (song.streamurl==""){
      var youtubedl = window.require('youtube-dl');
      var url = 'http://www.youtube.com/watch?v='+song.id;
      youtubedl.getInfo(url, ["--get-url", "--format=bestaudio"], function(err, info) {
        if (err) throw err;

        song.streamurl=info.url;
        callback();
      });
    }
  }

  songListChangeCallback(songs){
    this.setState({songList: songs, songListLoading: false});
  }

  songSearchStartCallback(){
    this.setState({songListLoading: true});
  }

  togglePlayCallback(){
    var _this=this;

    if(this.state.playStatus === Sound.status.PLAYING){
      this.setState({playStatus: Sound.status.PAUSED});
    } else {
      this.setState({playStatus: Sound.status.PLAYING});
      if(this.state.playQueue[0].streamurl==""){
        this.setState({nowPlayingLoading: true});
        this.fetchSongStreamUrl(this.state.playQueue[0],
                                function(){
                                  _this.setState({nowPlayingLoading: false});
                                });
      }
    }
  }

  addToQueue(song, event){
    var pq = this.state.playQueue;
    pq.push(song);
    this.setState({playQueue: pq});
  }

  handleSongPlaying(audio){
    this.setState({songProgress: audio.position/audio.duration});
  }

  handleSongFinished(){
    var _this=this;
    this.state.playQueue.shift();

    if (this.state.playQueue.length == 0){
      this.setState({playStatus: Sound.status.STOPPED});
    }

    if(this.state.playQueue[0].streamurl==""){
      _this.setState({nowPlayingLoading: true});
      this.fetchSongStreamUrl(this.state.playQueue[0],
                              function(){
                                _this.setState({nowPlayingLoading: false});
                              });
    }
  }

  renderSound(){
    if (this.state.playQueue.length>0){
      return (<Sound
       url={this.state.playQueue[0].streamurl}
       playStatus={this.state.playStatus}
       onPlaying={this.handleSongPlaying.bind(this)}
       onFinishedPlaying={this.handleSongFinished.bind(this)}
              />);
    } else {
      return [];
    }
  }

  render () {
    return (
        <div>
        <Navbar />

        <ToolsContainer
      songSearchStartCallback={this.songSearchStartCallback.bind(this)}
      songListChangeCallback={this.songListChangeCallback.bind(this)}
        />

        <SongList
      appContainer={this}
      addToQueue={this.addToQueue}
      songList={this.state.songList}
      loading={this.state.songListLoading}
        />

        <NowPlaying
      queue={this.state.playQueue}
      loading={this.state.nowPlayingLoading}
        />

        {this.renderSound()}

        <Player
      progress={this.state.songProgress}
      togglePlayCallback={this.togglePlayCallback.bind(this)}
      playStatus={this.state.playStatus}
        />
        </div>
    );
  }

}

AppContainer.YT_API_KEY =  'AIzaSyCIM4EzNqi1in22f4Z3Ru3iYvLaY8tc3bo';
export default AppContainer;
