// components/login/login.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    modalShow:Boolean
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    OnGotUserInfo(event){
      console.log(event)
      const userInfo = event.detail.userInfo
      //todo授权成功以后 将底部的弹出层隐藏
      if(userInfo){
        this.setData({
          modalShow:false
        })
        //? 授权成功以后将userInfo传给blog
        this.triggerEvent('loginsuccess',userInfo)
      }else{
        this.triggerEvent('loginfail')
      }
    }
  }
})
