// components/progress-bar/progress-bar.js
let movableAreaWidth = 0
let movableViewWidth = 0
let currentSec = -1
    // properties(Read only)(duration,currentTime,paused,buffered)
    // properties(src(m4a, aac, mp3, wav),startTime,title,epname,singer,coverImgUrl,webUrl,protocol)
const backAudioManager = wx.getBackgroundAudioManager();
let duration = 0 //以秒为单位展示的时长
let isMoving = false //标识量，解决拖动时，回闪现象
Component({
    /**
     * 组件的属性列表
     */
    properties: {

    },

    /**
     * 组件的初始数据
     */
    data: {
        showTime: {
            currentTime: '00:00',
            totalTime: '00:00',
        },
        movableDis: 0,
        progress: 0,
    },

    lifetimes: {
        ready() {
            this._getMovableDis()
            this._bindBGMEvent()
        },
    },
    /**
     * 组件的方法列表
     */
    methods: {
        onChange(event) {
            if (event.detail.source == 'touch') {
                this.data.progress = event.detail.x / (movableAreaWidth - movableViewWidth) * 100
                this.data.movableDis = event.detail.x
            }
            isMoving = true
        },
        onTouchEnd() {
            const currentTimeFmt = this._dateFormat(Math.floor(backAudioManager.currentTime))
            this.setData({
                progress: this.data.progress,
                movableDis: this.data.movableDis,
                ['showTime.currentTime']: currentTimeFmt.min + ':' + currentTimeFmt.sec,

            })
            backAudioManager.seek(duration * this.data.progress / 100)
            isMoving = false
        },
        _getMovableDis() {
            const query = this.createSelectorQuery();
            query.select('.movable-area').boundingClientRect()
            query.select('.movable-view').boundingClientRect()
            query.exec((rect) => {
                console.log(rect);
                movableAreaWidth = rect[0].width
                movableViewWidth = rect[1].width

            })

        },
        _bindBGMEvent() {
            backAudioManager.onPlay(() => {
                isMoving = false
            })
            backAudioManager.onStop(() => {

            })
            backAudioManager.onPause(() => {

            })
            backAudioManager.onWaiting(() => {

            })
            backAudioManager.onCanplay(() => {
                // backAudioManager.seek(duration * this.data.progress / 100)
                console.log("我是onCanplay的duration" + backAudioManager.duration);
                if (typeof backAudioManager.duration != 'undefined') {
                    this._setTime()
                } else {
                    setTimeout(() => {
                        this._setTime()
                    }, 1000)
                }
            })
            backAudioManager.onTimeUpdate(() => {

                const currentTime = backAudioManager.currentTime
                const duration = backAudioManager.duration
                const sec = currentTime.toString().split('.')[0]
                if (sec != currentSec) {
                    const currentTimeFmt = this._dateFormat(currentTime)
                    this.setData({
                        movableDis: (movableAreaWidth - movableViewWidth) * currentTime / duration,
                        progress: currentTime / duration * 100,
                        ['showTime.currentTime']: `${currentTimeFmt.min}:${currentTimeFmt.sec}`
                    })
                    currentSec = sec
                    console.log(currentTime);
                }


            })
            backAudioManager.onEnded(() => {
                this.triggerEvent('musicEnd')
            })
            backAudioManager.onError((res) => {
                wx.showToast({
                    title: '错误：' + res.errCode,
                })
            });
        },
        _setTime() {
            duration = backAudioManager.duration
            console.log('我是_setData的duration：' + duration);
            const durationFmt = this._dateFormat(duration)
            console.log(durationFmt);
            this.setData({
                ['showTime.totalTime']: `${durationFmt.min}:${durationFmt.sec}`
            })
        },
        _dateFormat(sec) {
            const min = Math.floor(sec / 60)
            sec = Math.floor(sec % 60)
            return {
                'min': this._parse0(min),
                'sec': this._parse0(sec),
            }
        },
        _parse0(sec) {
            return sec < 10 ? '0' + sec : sec
        }

    }
})