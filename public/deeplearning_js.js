const outVideo = document.getElementById("video-opencv");
var canvas = document.getElementById('canvas_output_img');
var ctx = canvas.getContext('2d');

async function openCVLoaded(){
    async function init(){
        const model = await tf.loadLayersModel('http://localhost:3500/model.json');
        console.log("Loaded the model successfully");
        return model
      }
      const face_expression_classifer = await init();

      const expression_emojis = ['😔', '😲', '😒', '😃' , '🙂', '😨', '😠'];
      const expressions = ['Sad', 'Surprise', 'Disgust', 'Happy', 'Neutral', 'Fear', 'Angry'];

    const video = document.getElementById("cam_input");
    navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
    }).then(stream => {
        video.srcObject = stream;
        video.play();

          video.addEventListener('play', function() {
            var $this = this; //cache
            (function loop() {
              if (!$this.paused && !$this.ended) {
                ctx.drawImage($this, 0, 0, 500,400);
                setTimeout(loop, 1000 / 30); // drawing at 30fps
              }
            })();
          }, 0);

        // var img = document.getElementById("cam_input");
		// img.width = "300px";
		// img.height = "300px";
        // ctx.drawImage(img, 0 , 0, 500, 400);
    })

    let src = new cv.Mat(video.height, video.width, cv.CV_8UC4);
    let dst = new cv.Mat(video.height, video.width, cv.CV_8UC1);
    let dst2 = new cv.Mat();
    let gray = new cv.Mat();
    let cap = new cv.VideoCapture(cam_input);
    let faces = new cv.RectVector();
    let classifer = new cv.CascadeClassifier();
    let utils = new Utils('errorMessage');
    let faceCascadeFile = 'haarcascade_frontalface_default.xml'; // path to xml
        utils.createFileFromUrl(faceCascadeFile, faceCascadeFile, () => {
            classifer.load(faceCascadeFile); // in the callback, load the cascade from file 
    });

    const FPS = 24;
    function processVideo() {
        let begin = Date.now();
        cap.read(src);
        src.copyTo(dst);
        cv.cvtColor(dst, gray, cv.COLOR_RGBA2GRAY, 0);
        try{
            classifer.detectMultiScale(gray, faces, 1.1, 3, 0);
            console.log(faces.size());
        }catch(err){
            console.log(err);
        }
        for (let i = 0; i < faces.size(); ++i) {
            let face = faces.get(i);
            // console.log("face is ",face)
            let point1 = new cv.Point(face.x, face.y);
            let point2 = new cv.Point(face.x + face.width, face.y + face.height);
            cv.rectangle(dst, point1, point2, [255, 0, 0, 255]);
            // let rect2 = new cv.Rect(face.x, face.y, face.width, face.height);
            // dst2 = src.roi(rect2);
            var imageData = ctx.getImageData(face.x, face.y, face.width, face.height);

            let tensor = tf.browser.fromPixels(imageData)
               .resizeNearestNeighbor([224,224])
               .toFloat()
               .expandDims();

               tensor =  tensor.div(255);
               face_expression_classifer.predict(tensor).data()
               .then((predictions)=>{
                    var i = predictions.indexOf(Math.max(...predictions));
                    ctx.strokeStyle = "#fff";
                    ctx.strokeRect(face.x, face.y, face.width, face.height);
                    ctx.font = "30px Arial";
                    ctx.fillStyle = "#fff"
                    ctx.fillText(expressions[i]+" "+expression_emojis[i], (face.x+face.width)/2, (face.y+face.height)/2);
               })
        }
        //cv.imshow("canvas_output", dst);
        // cv.imshow("canvas_output_img", dst2);
        // cv.imshow("canvas_output", dst2);
        // schedule next one.
        let delay = 1000/FPS - (Date.now() - begin);
        setTimeout(processVideo, delay);
    }
    // schedule first one.
    setTimeout(processVideo, 0);
    
}