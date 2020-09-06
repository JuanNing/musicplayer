// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
const rp = require('request-promise')
const URL = 'http://musicapi.leanapp.cn/user/playlist?uid=32953014'
const playlistCollection = await db.collection('playlist')

//数据条数的限制，100为小程序限制
const MAX_LIMIT = 100
    // 云函数入口函数
exports.main = async(event, context) => {
    /**
     * 此，只能获取100条数据，未突破限制
     * const list = await playlistCollection.get()
     */
    //突破限制的解决方法
    const countResult = await playlistCollection.count()
    const total = countResult.total
    const batchTimes = Math.ceil(total / MAX_LIMIT)
    const tasks = []
    for (let i = 0; i < batchTimes; i++) {
        let promise = playlistCollection.skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
        tasks.push(promise)
    }
    //前面的所有代码都是list下的data,所以为了对应，新建一个data数组
    let list = {
        data: []
    }
    if (tasks.length > 0) {
        list = (await Promise.all(task)).reduce((acc, cur) => {
            return {
                data: acc.data.concat(cur.data)
            }
        })
    }

    const playlist = await rp(URL).then((res) => {
            return JSON.parse(res).result
                // console.log('测试2');
                // console.log(JSON.parse(res).result);

        })
        // console.log('测试1');
        // console.log(playlist);
        //歌单去重操作
    const newData = []
    for (let i = 0, len1 = playlist.length; i < len1; i++) {
        let flag = true
        for (let j = 0, len2 = list.length; j < len2; j++) {
            if (playlist[i].id === list.data[j].id) {
                flag = false
                break
            }
        }
        if (flag) {
            newData.push(playlist[i])
        }
    }
    //将获取到的，去重的数据，存入云数据库中
    for (let i = 0, len = newData.length; i < len; i++) {
        await playlistCollection.add({
            data: {
                ...newData[i],
                createTime: db.serverDate()
            }
        }).then((res) => {
            console.log('插入成功');
        }).catch((err) => {
            console.log('插入失败');
        })
    }
    return newData.length
}