// components/lyric/lyric.js
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        isLyricShow: {
            type: Boolean,
            value: false,
        },
        lyric: String,

    },
    observers: {
        lyric(lrc) {
            console.log(lrc);
            this._parseLyric(lrc)
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        lrcList: {
            lrc: ['暂无歌词']
        },

    },

    /**
     * 组件的方法列表
     */
    methods: {
        _parseLyric(sLyric) {
            let line = sLyric.split('\n')
            line.forEach((elem) => {
                let time = elem.match(/\[(\d{2,}):(\d{2})(?:\.(\d{2,3}))?]/g)
                if (time != null) {
                    console.log(time);
                }
            })
        }
    }
})