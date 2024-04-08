<template>
  <template v-if="messages && messages.length > 0">
    <div class="message-box" v-for="(message, index) in messages" :key="index">
      <div class="message user-message">
          <p>{{ message.req }}</p>
      </div>
      <div class="message bot-message">
          <p>{{ message.res }}</p>
      </div>
    </div>
  </template>
  <template v-if="Object.keys(newMessage).length > 0 && newMessage.req.length > 0">
    <div class="message-box">
      <div class="message user-message">
        <p>{{ newMessage.req }}</p>
      </div>
      <div class="message bot-message">
        <p class="print">{{ newMessage.res }}</p>
      </div>
    </div>
  </template>
  <template v-if="messages.length == 0 && Object.keys(newMessage).length == 0">
    <div class="message-box">
      <p style="text-align: center; font-size: 24px; margin-top: 70px">Начните общение с нашим чат-ботом ChatterBlast!</p>
    </div>
  </template>
</template>

<script>
  export default {
    props: {
      messages: Array, 
      newMessage: Object
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
}

.print::after {
    content: '';
    width: 4px;
    height: 1em;
    background-color: white; 
    display: inline-block;
    margin-left: 2px;
    animation: cursor-blink 0.5s infinite;
}

@keyframes cursor-blink {
    0% {
        opacity: 1;
    }
    50% {
        opacity: 0.2;
    }
    100% {
        opacity: 1;
    }
}

</style>