const imageUpload = document.getElementById("image")
var leftHorn = new Image()
var rightHorn = new Image()
var hornSizeMod = 0.8
var hornSize
var hornOffset
var faceCurveOffset = 80
var foreheadSlider = document.getElementById("forehead")
leftHorn.src = "https://i.imgur.com/EBU0rKN.png"
rightHorn.src = "https://i.imgur.com/x1Ilyj2.png"

Promise.all//loads all the face detection models being used in parallel
([
	faceapi.nets.tinyFaceDetector.loadFromUri('/models'),//detects face
	faceapi.nets.faceLandmark68Net.loadFromUri('/models'),//detects features
]).then(start)

function start()
{
	imageUpload.addEventListener("change", async () =>
	{
		var container = document.getElementById("poop")
		while(container.firstChild)
		{
			container.removeChild(container.firstChild)
		}
		const image = await faceapi.bufferToImage(imageUpload.files[0])
		container.appendChild(image)
		const canvas = faceapi.createCanvasFromMedia(image)
		container.appendChild(canvas)
		const displaySize = {width: image.width, height: image.height}
		faceapi.matchDimensions(canvas, displaySize)
		const face_but_shit = await faceapi.detectSingleFace(image, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks()
		const face = faceapi.resizeResults(face_but_shit, displaySize)
		const points = face.landmarks._positions
		const leftEyeBrow = points[17]
		const rightEyeBrow = points[26]
		var chin = points[8]
		var curveOffsetVectorL = {xc: leftEyeBrow._x - chin._x, yc: leftEyeBrow._y - chin._y}//Vector from chin to left eyebrow.
		var curveOffsetVectorR = {xc: rightEyeBrow._x - chin._x, yc: rightEyeBrow._y - chin._y}//Vector from chin to right eyebrow.
		var magnitudeCOVL = Math.sqrt(Math.pow(curveOffsetVectorL.xc, 2) + Math.pow(curveOffsetVectorL.yc, 2))//Magnitude of vector from chin to left eyebrow.
		
		/*Buncha maths shit in order to determine where the bezier control point for the top of the face shape is located.
		Quick rundown of how it works, because you are going to forget you twp piece of shit:
		(each step is done for both left and right)
		1. Determines the vector from the chin to the corner of the eye.
		2. Determines the magnitude of this vector.
		3. Finds the corresponding unit vector for this vector, this gives us a direction.
		4. When the curve is drawn, a value of faceCurveOffset * by the repective component of the unit vector is added to the coordinates of the control points,
		offsetting the control point up relative to the face by an amount = faceCurveOffset.
		FUCK that was satisfying to work out.		
		*/
		var magnitudeCOVR = Math.sqrt(Math.pow(curveOffsetVectorR.xc, 2) + Math.pow(curveOffsetVectorR.yc, 2))//Magnitude of vector from chin to right eyebrow.
		var unitCOVL = {xc: curveOffsetVectorL.xc/magnitudeCOVL, yc: curveOffsetVectorL.yc/magnitudeCOVL}//Unit vector of curveOffsetVectorL Gives direction of offset for bezier point above eybrows dependant on face tilt.
		var unitCOVR = {xc: curveOffsetVectorR.xc/magnitudeCOVR, yc: curveOffsetVectorR.yc/magnitudeCOVR}//Unit vector of curveOffsetVectorR
		
		/*Determines height of detected face and scaling the horns. Done with height as a bit of a cheat: width more likely to change
		as face is tilted side to side, up and down less morement so that i guess. Also scaling the horn offset*/
		var faceHeight = face.detection.box.height
		hornSize = hornSizeMod*(faceHeight/3)
		hornOffset = hornSize/2
		var ctx = canvas.getContext('2d')		
		
		
		setInterval(async => {
			
			ctx.clearRect(0, 0, canvas.width, canvas.height)
			faceCurveOffset = foreheadSlider.value
			
			//draw shape of face
			ctx.beginPath();
			
			//drawing outline		
			ctx.moveTo(points[0]._x, points[0]._y)
			ctx.bezierCurveTo(leftEyeBrow._x + faceCurveOffset*unitCOVL.xc, leftEyeBrow._y + faceCurveOffset*unitCOVL.yc, rightEyeBrow._x + faceCurveOffset*unitCOVR.xc, rightEyeBrow._y + faceCurveOffset*unitCOVR.yc, points[16]._x, points[16]._y)
			ctx.lineTo(points[15]._x, points[15]._y)
			ctx.lineTo(points[14]._x, points[14]._y)
			ctx.lineTo(points[13]._x, points[13]._y)
			ctx.lineTo(points[12]._x, points[12]._y)
			ctx.lineTo(points[11]._x, points[11]._y)
			ctx.lineTo(points[10]._x, points[10]._y)
			ctx.lineTo(points[9]._x, points[9]._y)
			ctx.lineTo(points[8]._x, points[8]._y)
			ctx.lineTo(points[7]._x, points[7]._y)
			ctx.lineTo(points[6]._x, points[6]._y)
			ctx.lineTo(points[5]._x, points[5]._y)
			ctx.lineTo(points[4]._x, points[4]._y)
			ctx.lineTo(points[3]._x, points[3]._y)
			ctx.lineTo(points[2]._x, points[2]._y)
			ctx.lineTo(points[1]._x, points[1]._y)	
			ctx.lineTo(points[0]._x, points[0]._y)
			ctx.closePath()
			
			/*cutting out mouth: looks meh, cut out.
			ctx.moveTo(points[67]._x, points[67]._y)
			ctx.lineTo(points[66]._x, points[66]._y)
			ctx.lineTo(points[65]._x, points[65]._y)
			ctx.lineTo(points[64]._x, points[64]._y)
			ctx.lineTo(points[63]._x, points[63]._y)
			ctx.lineTo(points[62]._x, points[62]._y)
			ctx.lineTo(points[61]._x, points[61]._y)
			ctx.lineTo(points[60]._x, points[60]._y)
			ctx.closePath()*/

			//Fill
			ctx.fillStyle = "rgb(128, 128, 128, 0.4)"
			ctx.fill()

			//draw horns
			ctx.drawImage(leftHorn, leftEyeBrow._x - hornSize, leftEyeBrow._y - hornSize - hornOffset, hornSize, hornSize)
			ctx.drawImage(rightHorn, rightEyeBrow._x, rightEyeBrow._y - hornSize - hornOffset, hornSize, hornSize)
			
			//faceapi.draw.drawFaceLandmarks(canvas, face)
		}, 100)
	})
}