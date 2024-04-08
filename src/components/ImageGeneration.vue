<template>
    <template v-if="messages && messages.length > 0">
      <div class="message-box" v-for="(message, index) in messages" :key="index">
        <div class="message user-message">
            <p>{{ message.req }}</p>
        </div>
        <div class="message bot-message">
            <img :src="message.res" alt=""><br>
            <button class="action-button download" @click="downloadImage(message.res)">Download</button>
            <button class="action-button" @click="upscaleImage(message.resource_id)" :disabled="disabled">Upscale</button>
            <button class="action-button" @click="zoomInImage(message.resource_id)" :disabled="disabled">Zoom in</button>
            <button class="action-button" @click="zoomOutImage(message.resource_id)" :disabled="disabled">Zoom out</button>
        </div>
      </div>
    </template>
    <template v-if="Object.keys(newMessage).length > 0 && newMessage.req.length > 0">
      <div class="message-box">
        <div class="message user-message">
          <p>{{ newMessage.req }}</p>
        </div>
        <div class="message bot-message">
          <img :src="newMessage.res" alt=""><br>
          <p class="progress-bar">
            <span class="progress" :style="{ width: newMessage.progress + '%' }"></span><br>
          </p>
          {{ newMessage.progress + '%' }}
        </div>
      </div>
    </template>
    <template v-if="messages.length == 0 && Object.keys(newMessage).length == 0">
      <div class="message-box">
        <p style="text-align: center; font-size: 24px;">Начните генерировать изображения с DreamWeaver!</p>
      </div>
    </template>
  </template>
  
  <script>
    export default {
      props: {
        messages: Array, 
        newMessage: Object,
        disabled: Boolean,
        downloadImage: Function,
        upscaleImage: Function,
        zoomInImage: Function,
        zoomOutImage: Function
      }
    }
  </script>
  
  <style scoped>
  .message-box {
    margin-bottom: 30px;
  }
  
  .message-box:last-child {
    margin-bottom: 0;
  }
  
  .message {
    padding: 10px;
    margin-bottom: 10px;
    border-radius: 5px;
    color: #fff;
  }
  
  .user-message {
    background-color: #007bff;
  }
  
  .bot-message {
    background-color: #6c757d;
    text-align: center;
  }
  
  .progress-bar {
    margin-bottom: 5px;
    width: 100%;
    height: 1em;
    background-color: white; 
    border: 1px solid black;
    border-radius: 10px;
  }

  .progress {
    display: block;
    height: 100%;
    background-color: #007bff;
    border-radius: 10px;
  }
  
  .action-button {
    margin: 10px 5px 0 5px;
    font-size: 18px;
    padding: 10px 20px;
    background-color: #007bff;
    color: #fff;
    border-radius: 5px;
    cursor: pointer;
    transition: 0.3s;
  }

  .action-button:hover {
    background-color: #006ce0;
  }

  .chat-page.disabled button:not(.download) {
    cursor: no-drop !important;
  }
  </style>