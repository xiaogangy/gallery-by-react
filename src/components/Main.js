require('normalize.css/normalize.css');
require('styles/App.css');

import React from 'react';
import {findDOMNode} from 'react-dom';

//获取图片的相关数据
var imageDatas = require('../data/imageDatas.json');

// let yeomanImage = require('../images/yeoman.png');

//使用函数，将图片名信息转为图片的URL信息
function genImageURL(imageDatasArr){
	for(let i = 0, j = imageDatasArr.length; i < j; i++){
		let singleImageData = imageDatasArr[i];
		singleImageData.imageURL = require('../images/' + singleImageData.fileName);
		imageDatas[i] = singleImageData;
	}
	return imageDatasArr;
}

imageDatas = genImageURL(imageDatas);

//获取区间内的一个随机数
function getRangeRandom(low, high){
	return Math.floor(Math.random() * (high - low) + low);
}

//获取一个0~30°之间的正负角度
function get30DegRandom(){
	return ((Math.random() > 0.5 ? '' : '-') + Math.floor(Math.random() * 30));
}

//根组件
class AppComponent extends React.Component {

	constructor(props){
		super(props);
		this.constant = {
			centerPos:{  //中间位置的取值范围
				left:0,
				top:0
			},
			hPosRange:{     //左右分区的取值范围
				leftSecX: [0,0],
				rightSecX: [0,0],
				y:[0,0]
			},
			vPosRange: {   //上下分区的取值范围
				x: [0,0],
				topY:[0,0]
			}
		};
		//存储所有图片的状态（位置信息）
		this.state = {
			imgsArrangeArr:[
				// {
				// 	pos:{
				// 		left:'0',
				// 		top: '0'
				// 	},
				// 	rotate: 0,
				// 	isInverse: false //图片正反面
				// 	isCenter, false
				// }
			]
		};
		this.rearrange = this.rearrange.bind(this);
		this.reverse = this.reverse.bind(this);
		this.center = this.center.bind(this);
	}

	reverse(index){
		return function(){
			var imgsArrangeArr = this.state.imgsArrangeArr;
			imgsArrangeArr[index].isInverse = !(imgsArrangeArr[index].isInverse);

			this.setState({imgsArrangeArr: imgsArrangeArr});
		}.bind(this);
	}


	/*
	 * 重新布局所有图片
	 * @param centerIndex 指定居中布局哪个图片
	 */
	rearrange(centerIndex){
		//设置一个临时的数组，用于存储各个图片的位置信息，方便后面的setState的调用
		//获取设置的位置区域常量值
		var imgsArrangeArr = this.state.imgsArrangeArr,
			constant = this.constant,
			centerPos = constant.centerPos,
			hPosRange = constant.hPosRange,
			vPosRange = constant.vPosRange,
			hPosRangeLeftSecX = hPosRange.leftSecX,
			hPosRangeRightSecX = hPosRange.rightSecX,
			hPosRangeY = hPosRange.y,
			vPosRangeX = vPosRange.x,
			vPosRangeTopY = vPosRange.topY,
			
			//记录上侧区域的图片状态
			imgsArrangeTopArr = [],
			topImgNum = Math.floor(Math.random()*2),  //取一个或者不取
			topImgSpliceIndex = 0,
			
			//中心图片的状态信息
			imgsArrangeCenterArr = imgsArrangeArr.splice(centerIndex, 1);
			//首先居中centerIndex的图片,居中的图片不需要旋转
			imgsArrangeCenterArr[0] = {
				pos: centerPos,
				rotate: 0,
				isCenter: true
			};
			

			//取出要布局上侧的图片的状态信息
			topImgSpliceIndex = Math.floor(Math.random() * (imgsArrangeArr.length));
			imgsArrangeTopArr = imgsArrangeArr.splice(topImgSpliceIndex, topImgNum);
			//布局位于上侧的图片
			imgsArrangeTopArr.forEach(function(value, index){
				imgsArrangeTopArr[index] = {
					pos:{
						top: getRangeRandom(vPosRangeTopY[0],vPosRangeTopY[1]),
						left: getRangeRandom(vPosRangeX[0],vPosRangeX[1])
					},
					rotate: get30DegRandom(),
					isCenter: false
				};
				
			});

			//布局左右两侧的图片
			for(var i = 0, j = imgsArrangeArr.length, k = j / 2; i<j; i++){
				var hPosRangeLORX = null;

				if (i<k){
					hPosRangeLORX = hPosRangeLeftSecX;
				} else{
					hPosRangeLORX = hPosRangeRightSecX;
				}

				imgsArrangeArr[i] = {
					pos: {
						top: getRangeRandom(hPosRangeY[0], hPosRangeY[1]),
						left: getRangeRandom(hPosRangeLORX[0], hPosRangeLORX[1])
					},
					rotate: get30DegRandom(),
					isCenter: false

				};

			}

			//debugger;

			if(imgsArrangeTopArr && imgsArrangeTopArr[0]){
				imgsArrangeArr.splice(topImgSpliceIndex, 0, imgsArrangeTopArr[0]);
			}

			imgsArrangeArr.splice(centerIndex, 0, imgsArrangeCenterArr[0]);


			//更新状态值，开始重新渲染
			this.setState({
				imgsArrangeArr: imgsArrangeArr
			});

			
	}

	// 根据rearrange函数，居中对齐index位置的图片
	// 返回一个闭包函数
	center(index){
		return ()=>{this.rearrange(index);};
	}

	//组件加载以后，为每张图片计算其位置的范围
	componentDidMount(){

		//拿到舞台的大小
		var stageDOM = this.refs.stage,
			stageW = stageDOM.scrollWidth,
			stageH = stageDOM.scrollHeight,
			halfStageW = Math.floor(stageW/2),
			halfStageH = Math.floor(stageH/2);
		//console.log("舞台的大小" + stageH);
		//console.log(stageDOM);

		
		//拿到一个imgFigure的大小
		var imgFigureDOM = findDOMNode(this.refs.imgFigure0),
			imgW = imgFigureDOM.scrollWidth,
			imgH = imgFigureDOM.scrollHeight,
			halfImgW = Math.floor(imgW/2),
			halfImgH = Math.floor(imgH/2);
		//console.log("图片的大小" + imgW);

		//下面开始初始化位置常量中的各个值
		//计算中心图片的位置点：
		this.constant.centerPos = {
			left: halfStageW - halfImgW,
			top: halfStageH - halfImgH
		};

		//计算左右区域的取值范围：
		this.constant.hPosRange.leftSecX[0] = -halfImgW;
		this.constant.hPosRange.leftSecX[1] = halfStageW - halfImgW * 3;
		this.constant.hPosRange.rightSecX[0] = halfStageW + halfImgW;
		this.constant.hPosRange.rightSecX[1] = stageW - halfImgW;
		this.constant.hPosRange.y[0] = - halfImgH;
		this.constant.hPosRange.y[1] = stageH - halfImgH;

		//计算上区域的取值范围：
		this.constant.vPosRange.x[0] = halfStageW - imgW;
		this.constant.vPosRange.x[1] = halfStageW;
		this.constant.vPosRange.topY[0] = - halfImgH;
		this.constant.vPosRange.topY[1] = halfStageH - halfImgH * 3;

		//位置区域确定后，让页面重新渲染，这次图片要随机分布
		this.rearrange(0);

	}
	

	render() {
	
		var controllerUnits = [];
		var imgFigures =[];

		imageDatas.forEach(function (value,index) {
			
			//对于每一个图片，先将其位置信息保存到组件的状态里
			if(!this.state.imgsArrangeArr[index]){
				this.state.imgsArrangeArr[index] = {
					pos:{
						left:0,
						top:0
					},
					rotate: 0,
					isInverse: false,
					isCenter: false
				}
			}
			//console.log(this.state.imgsArrangeArr.pos);

			imgFigures.push(<ImgFigure data={value} key={index} ref = {'imgFigure' + index}
				arrange = {this.state.imgsArrangeArr[index]}
				reverse = {this.reverse(index)}
				center = {this.center(index)}
				/>);

			controllerUnits.push(<ControllerUnit key = {index}
				arrange = {this.state.imgsArrangeArr[index]}
				reverse = {this.reverse(index)}
				center = {this.center(index)}
				/>);

		}.bind(this));
	

   		return (
			<section className = "stage" ref="stage">
				<section className = "img-sec">
					{imgFigures}
				</section>
				<nav className = "controller-nav">
					{controllerUnits}
				</nav>
			</section>
 	  	);
  	}
}


//显示图片的组件
class ImgFigure extends React.Component{

	constructor(props){
		super(props);
		this.handleClick = this.handleClick.bind(this);
	}

	handleClick(e){
		
		if(this.props.arrange.isCenter){
			this.props.reverse();
		} else{
			this.props.center();
		}
		 
		e.stopPropagation();
		e.preventDefault();
	}

	render(){

		var styleObj = {};

		//如果属性中含有arrange属性，而且该属性值不为空，则设置styleObj作为样式对象
		if(this.props.arrange.pos){
			styleObj = this.props.arrange.pos;
		}
		if(this.props.arrange.isCenter){
			styleObj.zIndex = 11;
		}
		
		//如果图片的旋转角度有值并且不为0，添加旋转角度 
		//兼容各种浏览器
		if(this.props.arrange.rotate){
			(['ms','Webkit','Moz','']).forEach(function(value){
				styleObj[value + 'Transform'] = 'rotate(' + this.props.arrange.rotate
			+ 'deg)';
			}.bind(this));
		}

		var imgFigureClassName = 'img-figure';
		imgFigureClassName += this.props.arrange.isInverse? ' is-inverse':'';

		return(
			<figure className = {imgFigureClassName} style = {styleObj}
			onClick = {this.handleClick}>
				<img src={this.props.data.imageURL}
					 alt={this.props.data.title}
				/>
				<figcaption>
					<h2 className = "img-title">{this.props.data.title}</h2>
					<div className = "img-back" onClick = {this.handleClick}>
						<p>{this.props.data.desc}</p>
					</div>
				</figcaption>
			</figure>		
		)
	}
}

class ControllerUnit extends React.Component{
	constructor(props){
		super(props);
		this.handleClick = this.handleClick.bind(this);
	}

	handleClick(e){
		
		if(this.props.arrange.isCenter){
			this.props.reverse();
		}else{
			this.props.center();
		}
		e.stopPropagation();
		e.preventDefault();
	}

	render(){

		var controllerUnitClassName = 'controller-unit';
		//如果对应的是居中的图片，显示控制按钮的居中态
		if(this.props.arrange.isCenter){
			console.log('i am comign')
			controllerUnitClassName += ' is-center';
			//如果对应的图片状态刚好是背面，则显示图片的背部
			if(this.props.arrange.isInverse){
				controllerUnitClassName += ' is-inverse2';
			}
		}
		console.log(controllerUnitClassName);


		return (
			<span className = {controllerUnitClassName} onClick = {this.handleClick}>
			</span>
		)
	}
}

AppComponent.defaultProps = {
};

export default AppComponent;
