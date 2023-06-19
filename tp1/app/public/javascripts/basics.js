
/** Atualizar notificacao como vista */
function seenNotification(notificationId){
    var notification = document.getElementById(notificationId)
    var n_notifications = document.getElementById('nNotifications')
    // enviar ao servidor pedido de autalizacao
    fetch(`/users/api/notifications/seen/${notificationId}`,{
        method: 'POST'
    })
    .then(response => {
        // atualizar elemento da notificacao
        n_notifications.textContent = parseInt(n_notifications.textContent) - 1
        notification.getElementsByClassName('seen')[0].remove()
    })
}

/** Remover notificacao */
function removeNotification(notificationId){
    var notification = document.getElementById(notificationId)
    var n_notifications = document.getElementById('nNotifications')
    // enviar ao servidor pedido de remocao
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

/**  Obter notificaçoes de utilizador*/
async function getNotifications(){
    fetch('/users/api/notifications',{
        method: 'GET'
    })
    .then(response => {
        if(response.ok){
            response.json().then(
                data =>{
                    if(data.notifications){
                        var notifications = data.notifications.sort((a,b) => new Date(b.dateCreated) - new Date(a.dateCreated))
                        var notification_content = document.getElementById('notificationsContent')
                        var n_notifications = document.getElementById('nNotifications')
                        var n_notifications_count = 0
                        // criar elementos para as notificacoes
                        for(i in notifications){
                            notification = notifications[i]
                            node = document.createElement('div')
                            node.onclick = function(){seenNotification(notification._id)}
                            innerHtml = `<p>${notification.message}</p>`
                            // notificação tem ligação direta
                            if(notification.url){
                                innerHtml = `<a href="${notification.url}">${innerHtml}</a>`
                            }
                            innerHtml += `<p>Data : ${new Date(notification.dateCreated).toISOString().substring(0,19)}</p>`
                            // notificação ainda nao foi vista
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
                        // atualizar valor de numero de notificacoes
                        if(n_notifications_count > 0)
                            n_notifications.style.display='block'
                        else
                            n_notifications.style.display='none'
                    }
                }
            )
        }
    })
}


/** Adicionar novo elemento para relacoes no inquerito */
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
    // primeira relacao, adiciona no inicio
    if(relations.length == 0){
        var node = document.createElement('div')
        node.classList.add('w3-container')
        node.innerHTML = baseRelation.replace(new RegExp('\\$replace','g'),relations.length.toString())
        relationsContainer.appendChild(node)
        relationsContainer.append(addRelationBtn)
    }
    // adicionar no final da lista, trocar posicao do botao de adicionar relacao
    // apenas adiciona novo elemento se o anterior estiver preenchido
    else{
        var lastRelation = relations[relations.length-1]
        var lastRelationInputs = lastRelation.getElementsByTagName('input')
        var filled = false
        // verificar se ultimo elemento esta preenchido
        for(i in lastRelationInputs){
            if(lastRelationInputs[i].value && lastRelationInputs[i].value != ''){
                filled = true
                break
            }
        }
        if(filled){
            var maxId = 0
            var i = 0
            // verificar id disponivel para nova relacao
            while(i < relations.length){
                let r = relations.item(i)
                let rId = parseInt(r.id.split('relation')[1])
                if(rId >= maxId)
                    maxId = rId+ 1
                i++
            } 
            var node = document.createElement('div')
            node.classList.add('w3-container')
            node.innerHTML = baseRelation.replace(new RegExp('\\$replace','g'),maxId.toString())
            relationsContainer.appendChild(node)
            relationsContainer.append(addRelationBtn)
        }
    }
}

/** Remover elemento de relacao do inquerito */
function removeRelation(id){
    var relation = document.getElementById(id)
    if(relation){
        relation.remove()
    }
}


/**  Executa o get de acordo com os valores dos filtros de pesquisa*/
function search(){
    var searchContainer = document.getElementById('searchBar')
    var searchInputs = searchContainer.getElementsByTagName('input')
    query = []
    for(i in searchInputs){
        let searchInput = searchInputs[i]
        if(searchInput.value){
            query.push(`${searchInput.name}=${searchInput.value}`)
        }
    }
    if(query.length > 0){
        window.location.replace(`/?${query.join('&')}`)
    }else{
        window.location.replace('/')
    }
}

/** Altera o valor de query de paginacao */
function paginationQuery(pageNumber){
    var urlParams = new URLSearchParams(window.location.search);
    urlParams.set('page', pageNumber)
    window.location.search = urlParams.toString()
}

/** Altera o valor de query de sort */
function sortQuery(sortType){
    var urlParams = new URLSearchParams(window.location.search);
    urlParams.set('sort', sortType)
    window.location.search = urlParams.toString()
}

/** Verifica periodo de filtragem escolhido
 * Impede botao de submissao se periodo for invalido
 */
function verifyPeriod(){
    var startElem = document.getElementsByName('searchTimeStart')[0]
    var endElem = document.getElementsByName('searchTimeEnd')[0]
    var searchBtn = document.getElementById('searchBtn')
    var searchMessage = document.getElementById('searchMessage')
    if(startElem.value && endElem.value){
        // tempo de inicio maior do que o de fim
        if(startElem.value> endElem.value){
            searchBtn.disabled = true
            searchMessage.textContent = 'Período escolhido inválido'
        }else{
            searchBtn.disabled = false
            searchMessage.textContent = ''
        }
    }
}