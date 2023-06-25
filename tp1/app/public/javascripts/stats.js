var chart1 = null 
var chart2 = null


/** Pedir estatisticas das top inquiricoes e preencher grafico */
function fillTopInquiriesChartToday(){
  var topN = 10
  var type = 'visit'
  var lowerDate = new Date()
  lowerDate.setDate(lowerDate.getDate() -1) 
  lowerDate = lowerDate.toDateString()
  var upperDate = new Date()
  upperDate.setDate(upperDate.getDate() +1)
  upperDate = upperDate.toDateString()
  // procurar valor de numero maximo de inquiricoes no top
  var selectTopN = document.getElementById('selectNumberInquiriesChart1')
  if(selectTopN.value){
    topN = selectTopN.value
  }
  // procurar valor do tipo de atividade a filtrar
  var typeElem = document.getElementById('selectTypeActivityChart1')
  if(typeElem.value){
    type = typeElem.value
  }
  // procurar valor minimo do periodo de tempo
  var lowerDateElem = document.getElementById('selectLowerDateChart1')
  if(lowerDateElem.value){
    lowerDate = new Date(lowerDateElem.value).toDateString()
  }
  // procurar valor maximo do periodo de tempo
  var upperDateElem = document.getElementById('selectUpperDateChart1')
  if(upperDateElem.value){
    upperDate = new Date(upperDateElem.value).toDateString()
  }
  
  // get das estatisticas
  fetch(`/stats/top?top=${topN}&type=${type}&lowerDate=${lowerDate}&upperDate=${upperDate}`,{
    method: 'GET'
  })
  .then(response => {
    if(response.ok){
      response.json().then(
        data =>{
          // processar dados e criar opcoes do grafico
          var xyValues = [];
          var barColors = ["grey"];
          var topActivities = data.activities
          for(i in topActivities){
            let activity = topActivities[i]
            xyValues.push({'id':activity._id,'count':activity.count,'link':`/inquiry/${activity._id}`})
          }
          var data = {
            datasets: [{
              label : 'visitas totais',
              backgroundColor: barColors,
              data: xyValues
            }]
          }
          var options = {
            parsing:{
              xAxisKey:'id',
              yAxisKey:'count'
            },
            scales: {
              y: {
                suggestedMin: 0
              }
            }
          }
          // update grafico
          if(chart1){
            chart1.data = data
            chart1.options = options
            chart1.update()
          }
          // criar grafico
          else{
            chart1 = new Chart('topInquiriesChartToday',{type: 'bar',data:data,options:options})
            document.getElementById('topInquiriesChartToday').onclick = chartOnClick1
          }
        }
      )
      
    }
  })
}

/** Funcao Onclick para o primeiro grafico (abrir pagina de inquiricao) */
function chartOnClick1(click){
  const points = chart1.getElementsAtEventForMode(click,'nearest',{intersect:true},true)
  if(points.length){
    const firstPoint = points[0]
    
    const value = chart1.data.datasets[firstPoint.datasetIndex].data[firstPoint.index]
    window.open(value.link)
  }
}

/** Pedir estatisticas de uma inquirição e preencher grafico */
function fillInquiryChart(){
  var type = 'visit'
  var lowerDate = new Date()
  lowerDate.setDate(lowerDate.getDate() -1)
  lowerDate = lowerDate.toDateString()
  var upperDate = new Date()
  upperDate.setDate(upperDate.getDate() +1)
  upperDate = upperDate.toDateString()
  // valor do tipo de atividade a filtrar
  var typeElem = document.getElementById('selectTypeActivityChart2')
  if(typeElem.value){
    type = typeElem.value
  }
  // limite inferior do periodo de tempo
  var lowerDateElem = document.getElementById('selectLowerDateChart2')
  if(lowerDateElem.value){
    lowerDate = new Date(lowerDateElem.value).toDateString()
  }
  // limite superior do periodo de tempo
  var upperDateElem = document.getElementById('selectUpperDateChart2')
  if(upperDateElem.value){
    upperDate = new Date(upperDateElem.value).toDateString()
  }
  // id de inquiricao a pesquisar
  var inquiryId = document.getElementById('inquiryIdChart2').value

  // so faz pedido se tiver id de inquiricao
  if(inquiryId){
    fetch(`/stats/inquiry/${inquiryId}?type=${type}&lowerDate=${lowerDate}&upperDate=${upperDate}`,{
      method: 'GET'
    })
    .then(response => {
      if(response.ok){
        response.json().then(
          data =>{
            // processar dados e criar opcoes do grafico
            var xyValues = [];
            var barColors = ["grey"];
            var topActivities = data.activities
            for(i in topActivities){
              let activity = topActivities[i]
              xyValues.push({'id':activity._id,'count':activity.count})
            }
            var data = {
              datasets: [{
                label : 'visitas totais',
                backgroundColor: barColors,
                data: xyValues
              }]
            }
            var options = {
              parsing:{
                xAxisKey:'id',
                yAxisKey:'count'
              },
              scales: {
                y: {
                  suggestedMin: 0
                }
              }
            }
            // atualizar grafico
            if(chart2){
              chart2.data = data
              chart2.options = options
              chart2.update()
            }
            // criar grafico
            else{
              chart2 = new Chart('inquiryChart',{type: 'bar',data:data,options:options})
            }
          }
        )
        
      }
    })
  }
}
