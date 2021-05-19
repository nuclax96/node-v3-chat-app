const socket = io()

//Elements
const $messageForm= document.querySelector('#message-form')
const $messageFormInput= $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages= document.querySelector('#messages')



//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate=document.querySelector('#sidebar-template').innerHTML

//Options
 const {username,room} =  Qs.parse(location.search,{ignoreQueryPrefix :true })

 const autoscroll=()=>{
    //Get new message element
    const $newMessage=$messages.lastElementChild

    // Get the Height of the new Message .ie how long the message is
    const newMessageStyles=getComputedStyle($newMessage)
    const newMessageMargin=parseInt(newMessageStyles.marginBottom)
    const newMessageHeight=$newMessage.offsetHeight+newMessageMargin

    //Visible Height
    const visibleHeight= $messages.offsetHeight

    //Height of message container

    const containerHeight= $messages.scrollHeight

    //How far have we scrolled
    const scrollOffset=$messages.scrollTop +visibleHeight
    if(containerHeight-newMessageHeight<=scrollOffset)
    {
        $messages.scrollTop=$messages.scrollHeight
    }
 }
//locationMessage

socket.on('locationMessage',(message)=>{
    // console.log(message)
    
        const html = Mustache.render(locationTemplate,{
            'url':message.url,
            'userName':message.username,
            'createdAt':moment(message.createdAt).format('h:mm A')
        })

        $messages.insertAdjacentHTML('beforeend',html)
        autoscroll()
})

socket.on('Message',(message)=>{
    console.log(message)
    const html = Mustache.render(messageTemplate,{
        'userName':message.username,
       'message' :message.text  ,       // short hand syntax for 'message':message
       'createdAt': moment(message.createdAt).format('h:mm A')
    })                  //Rendering data for template with mustache
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('roomData',({room,users})=>{
   const html = Mustache.render(sidebarTemplate,{
       room,
       users
   })
   document.querySelector('#sidebar').innerHTML=html
})

$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()
    //Disbale when message is being sent
    $messageFormButton.setAttribute('disabled','disabled')
    var textMsg=e.target.elements.message.value
    
    socket.emit('sendMessage',textMsg,(error)=>{
        $messageFormButton.removeAttribute('disabled','disabled')
        $messageFormInput.value=''
        $messageFormInput.focus()
        if(error)
        {
            return console.log(error)
        }
        //Enable form
        
        console.log('message delvered')
    })
})

//Send Location
$sendLocationButton.addEventListener('click',()=>{
    if(!navigator.geolocation)
    {
        return alert('Geolocation not supporterd by your browser')

    }
    navigator.geolocation.getCurrentPosition((position)=>{
        //Disable
        $sendLocationButton.setAttribute('disabled','disabled')
        socket.emit('sendLocation',{
            latitude:position.coords.latitude,
            longitude:position.coords.longitude}
    ,() => {
        $sendLocationButton.removeAttribute('disabled','disabled')
        console.log('Delivered')
    })
})

})

socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error)
        location.href='/'
    }
})
