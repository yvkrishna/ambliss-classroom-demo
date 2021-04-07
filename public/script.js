const socket = io('/')
const videoGrid = document.getElementById('video-grid')
var user_name = undefined;
const myPeer = new Peer(undefined, {
  path: '/peerjs',
  host: '/',
  port: '443'
})
console.log("inside script")
let myVideoStream;
const myVideo = document.createElement('video')
myVideo.muted = true;
const peers = {}
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  myVideoStream = stream;
  addVideoStream(myVideo, stream)
  myPeer.on('call', call => {
    call.answer(stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream)
    })
  })

  socket.on('user-connected', userId => {
    connectToNewUser(userId, stream)
  })
  // input value
  let text = $("#chat_message");
  // when press enter send message
  $('html').keydown(function (e) {
    if (e.which == 13 && text.val().length !== 0) {
      if(user_name != undefined){
        socket.emit('message', {usr:user_name, msg:text.val()});
        text.val('')
      }else{
        var popup_btn = document.getElementById("popup_msg");
        popup_btn.click();
        takeUserName("Please enter your name before sending any messages.");
      }
      
    }
  });
  socket.on("createMessage", message => {
    var html_li_chat;
    if(message.usr==user_name){
      html_li_chat = `<li class="list-group-item list-group-item-info"><b>${message.usr}</b><br/>${message.msg}</li>`
    }else{
      html_li_chat = `<li class="list-group-item list-group-item-warning"><b>${message.usr}</b><br/>${message.msg}</li>`
    }
    $("ul").append(html_li_chat);
    scrollToBottom()
  })
})

socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close()
})

myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id)
})

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream)
  const video = document.createElement('video')
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
  })
  call.on('close', () => {
    video.remove()
  })

  peers[userId] = call
}

function getUserName(){
  return user_name;
}

function addVideoStream(video, stream) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
    if (video.networkState === video.NETWORK_LOADING) {
      const html_err_msg = 
      `
      <span>someone is having network issue.</span>
      <br>
      `
        var err_list = document.getElementById('error_list').innerHTML;
        err_list = err_list + html_err_msg
        console.log("someone is having network issue.")// The user agent is actively trying to download data.
    }
    
    if (video.readyState < video.HAVE_FUTURE_DATA) {
      const html_err_msg = 
      `
      <span>There is not enough data to keep playing from this point.</span>
      <br>
      `
        var err_list = document.getElementById('error_list').innerHTML;
        err_list = err_list + html_err_msg
      console.log("There is not enough data to keep playing from this point")// There is not enough data to keep playing from this point
    }
    updateNumUsersInHome();
  })
  const br = document.createElement('br')
  videoGrid.append(video)
  videoGrid.append(br)
}

function updateNumUsersInHome(){
  var numUsers = document.querySelectorAll('video').length - 1;
  document.getElementById("numPeople").innerText = numUsers;
}


window.onload = function() {
  var popup_btn = document.getElementById("popup_msg");
  popup_btn.click();
  takeUserName("Please Enter Your Name");
};

function takeUserName(alertMsg){
  const html_value = `
  <div class="alert alert-success" role="alert">
     ${alertMsg}
  </div>
  <div class="form-group">
     <label for="name">Name</label>
     <input type="text" class="form-control" id="name" placeholder="Your Name">
  </div>
  <br>
  <button type="button" class="btn btn-primary" onclick="saveName()" data-dismiss="modal">Save</button>
  `
  document.querySelector('#modalBody').innerHTML = html_value;
  document.querySelector('#exampleModalLongTitle').innerHTML = "AmBliss Video Calling DemoApp"
}

function saveName(){
  user_name = document.querySelector('#name').value;
  document.getElementById("usr_name").innerHTML = user_name
}



const scrollToBottom = () => {
  var d = $('.main__chat_window');
  d.scrollTop(d.prop("scrollHeight"));
}


const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
}

const playStop = () => {
  console.log('object')
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo()
  } else {
    setStopVideo()
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
}

const setMuteButton = () => {
  const html = `
  <button type="button" class="btn btn-primary">
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
    </button>
  `
  document.querySelector('.main__mute_button').innerHTML = html;
}

const setUnmuteButton = () => {
  const html = `
    <button type="button" class="btn btn-primary">
      <i class="unmute fas fa-microphone-slash"></i>
      <span>Unmute</span>
    </button>
  `
  document.querySelector('.main__mute_button').innerHTML = html;
}

const setStopVideo = () => {
  const html = `
  <button type="button" class="btn btn-primary">
    <i class="fas fa-video"></i>
    <span>Stop Video</span>
    </button>
  `
  document.querySelector('.main__video_button').innerHTML = html;
}

const setPlayVideo = () => {
  const html = `
  <button type="button" class="btn btn-primary">
    <i class="stop fas fa-video-slash"></i>
    <span>Play Video</span>
  </button>
  `
  document.querySelector('.main__video_button').innerHTML = html;
}