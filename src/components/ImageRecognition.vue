<template>
    <template v-if="messages && messages.length > 0">
      <div class="message-box" v-for="(message, index) in messages" :key="index">
        <div class="message bot-message">
            <div class="image-container">
                <img :src="message.req">
                <div v-for="(object, index) in message.res" :key="index" class="label"
                    :style="{
                        left: object.bounding_box.x + 'px',
                        top: object.bounding_box.y + 'px',
                        width: object.bounding_box.width + 'px',
                        height: object.bounding_box.height + 'px'
                    }">
                    <div class="rectangle"></div>
                    <span class="image-text">{{ object.name + ' ' + (object.probability * 100).toFixed(2) + '%' }}</span>
                </div>
            </div>
            <p>Было распознано объектов: {{ message.res.length }}</p>
        </div>
      </div>
    </template>
    <template v-if="messages.length == 0 && Object.keys(newMessage).length == 0">
      <div class="message-box">
        <p style="text-align: center; font-size: 24px;">Начните генерировать изображения с MindReader!</p>
      </div>
    </template>
  </template>
  
  <script>
    export default {
      props: {
        messages: Array,
        progress: Number
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
  
  .bot-message {
    background-color: #6c757d;
    text-align: center;
  }

  .image-container {
    position: relative;
    width: min-content;
    margin: 0 auto;
  }

  .label {
    position: absolute;
  }

  .rectangle {
    width: 100%;
    height: 100%;
    position: absolute;
    border: 5px solid rgba(255, 0, 0, 0.5);
  }

  .image-text {
    position: absolute; 
    top: -27px; 
    left: 0; 
    font-size: 20px;
    font-weight: 600;
    color: rgba(255, 0, 0, 0.6);
    white-space: nowrap;
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