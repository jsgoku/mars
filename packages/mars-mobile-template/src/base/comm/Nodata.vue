<template>
  <div class="no-data">
    <div class="content">
      <img src="../../assets/icon_no_data.png">
      <div class="desc">暂无更多数据</div>
    </div>
  </div>
</template>
<style scoped>
.no-data {
  position: absolute;
  right: 0;
  left: 0;
  height: 100%;
  top: 0;
  bottom: 0;
  padding-top: 3.6rem;
  overflow-y: auto;
  background: #fff;
}
.no-data img {
  width: 100px;
}
.content {
  position: absolute;
  margin: auto;
  width: 100px;
  height: 100px;
  top: 45%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.desc {
  color: #7f7f7f;
  margin-top: 10px;
}
</style>
