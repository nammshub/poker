class BlindChangeListener{

        handleMessage(message,playerMemo){
            playerMemo.bigBlind = message.data.big;
        }
}

module.exports = BlindChangeListener;