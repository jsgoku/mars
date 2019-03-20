const swipe = (self) => {
  /* eslint-disable */
  self.$nextTick(() => {
    const $self = self; // 将$self保存 区分以下触发事件的self
    const container = document.querySelectorAll('.swipe-list ul li a');
    // 为每个特定DOM元素绑定touchstart touchmove时间监听 判断滑动方向
    for (let i = 0; i < container.length; i += 1) {
      let sx = '';
      let mx = '';
      container[i].addEventListener('touchstart', (event) => { // 点横坐标
        sx = event.changedTouches[0].pageX;
      });
      container[i].addEventListener('touchmove', function (event) {
        mx = event.changedTouches[0].pageX; // 记录当前触控点横坐标
        if ($self.expansion) { // 判断是否展开，如果展开则收起
          $self.expansion.className = '';
        }
        if (mx - sx > 55) { // 右滑
          this.className = ''; // 右滑收起
        }
        if (sx - mx > 55) { // 左滑
          this.className = 'swipeleft';  // 左滑展开
          $self.expansion = this;
        }
      });
    }
  });
  /* eslint-disable */
};

export default swipe;