function seenNotification(notificationId){
    var notification = document.getElementById(notificationId)
    var n_notifications = document.getElementById('nNotifications')
    console.log(notificationId)
    fetch(`/users/api/notifications/seen/${notificationId}`,{
        method: 'POST'
    })
    .then(response => {
        n_notifications.textContent = parseInt(n_notifications.textContent) - 1
        notification.getElementsByClassName('seen')[0].remove()
    })
}


function removeNotification(notificationId){
    var notification = document.getElementById(notificationId)
    var n_notifications = document.getElementById('nNotifications')
    fetch(`/users/api/notifications/remove/${notificationId}`,{
        method: 'POST'
    })
    .then(response => {
        if(notification.getElementsByClassName('seen').length > 0){
            n_notifications.textContent = parseInt(n_notifications.textContent) - 1
        }
        notification.remove()
    })
}


function getNotifications(){
    fetch('/users/api/notifications',{
        method: 'GET'
    })
    .then(response => {
        if(response.ok){
            response.json().then(
                data =>{
                    var notifications = data.notifications
                    var notification_content = document.getElementById('notificationsContent')
                    var n_notifications = document.getElementById('nNotifications')
                    var n_notifications_count = 0
                    for(i in notifications){
                        notification = notifications[i]
                        node = document.createElement('div')
                        innerHtml = `<p>${notification.message}</p>`
                        if(notification.url){
                            innerHtml = `<a href="${notification.url}">${innerHtml}</a>`
                        }
                        if(notification.seen == false){
                            n_notifications_count += 1
                            node.style.backgroundColor = "grey"
                            innerHtml = `${innerHtml} <button type='button' class='seen' onclick='seenNotification("${notification._id}")'>V</button>`
                        }
                        innerHtml = `${innerHtml} <button type='button' onclick='removeNotification("${notification._id}")'>X</button>`
                        node.innerHTML = innerHtml
                        node.id = notification._id
                        notification_content.appendChild(node)
                    }
                    n_notifications.textContent = n_notifications_count
                    if(n_notifications_count > 0)
                        n_notifications.style.display='block'
                }
            )
        }
    })
}



function addRelationForm() {
    var relationsContainer = document.getElementById('relationsContainer')
    var relations = relationsContainer.getElementsByTagName('relation')
    var addRelationBtn = document.getElementById('addRelationBtn')
    var baseRelation =`
            <relation id="relation$replace">
                <label>
                    <b>Nome</b> : <input class="w3-input" type="text" name="relationName" value="" required>
                </label>
                <br>
                <label>
                    <b>Relação</b> :<input class="w3-input" type="text" name="relationType" value="" required>
                </label>
                <br>
                <label>
                    <b>ID do Processo</b> :<input class="w3-input" type="number" name="relationId" value="" required>
                </label>
                <br>
                <button class="w3-btn w3-blue" type="button" id="removeRelationBtn" onclick="removeRelation('relation$replace')">-</button>
            </relation>
        `
    if(relations.length == 0){
        var node = document.createElement('div')
        node.classList.add('w3-container')
        node.innerHTML = baseRelation.replace(new RegExp('\\$replace','g'),relations.length.toString())
        relationsContainer.appendChild(node)
        relationsContainer.append(addRelationBtn)
    }else{
        var lastRelation = relations[relations.length-1]
        var lastRelationInputs = lastRelation.getElementsByTagName('input')
        var filled = false
        for(i in lastRelationInputs){
            if(lastRelationInputs[i].value && lastRelationInputs[i].value != ''){
                filled = true
                break
            }
        }
        if(filled){
            var node = document.createElement('div')
            node.classList.add('w3-container')
            node.innerHTML = baseRelation.replace(new RegExp('\\$replace','g'),relations.length.toString())
            relationsContainer.appendChild(node)
            relationsContainer.append(addRelationBtn)
        }
    }
}

function removeRelation(id){
    var relation = document.getElementById(id)
    if(relation){
        relation.remove()
    }
}