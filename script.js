$( document ).ready(function(){

  const $map = $('.map')
  const $grid = $('.grid')
  const directions = ['north','east','south','west']
  const passage_types = ['open','door','secret door']
  const max_chambers = 5
  const max_passages_per_chamber = 5

  let grid_size = parseInt($map.css('font-size'))
  let map_width = Math.floor($map.width() / grid_size)
  let map_height = Math.floor($map.height() / grid_size)
  let map_margin_left = ($map.width() % grid_size)/2
  let map_margin_top = ($map.height() % grid_size)/2
  $map.width(map_width * grid_size)
  $map.height(map_height * grid_size)
  //$map.css('margin','map_margin_top map_margin_left')

  console.log()

  let chambers = []
  let passages = []

  function addChamber(first_passage){
    let chamber = {
      id: chambers.length,
      position: {
        left: Math.floor(map_width/2),
        top: Math.floor(map_height/2)
      },
      size: {
        height: Math.ceil(Math.random()*5),
        width: Math.ceil(Math.random()*5)
      },
      passages: []
    }
    if (first_passage){
      console.log('addChamber() has been passed an argument')
      first_passage.chambers.push(chamber.id)
      switch (first_passage.direction) {
        case 'north':
          chamber.position.left = first_passage.position.left + Math.ceil(Math.random() * chamber.size.width) - chamber.size.width
          chamber.position.top = first_passage.position.top - chamber.size.height
          break;
        case 'east':
          chamber.position.left = first_passage.position.left + 1
          chamber.position.top = first_passage.position.top + Math.ceil(Math.random() * chamber.size.height) - chamber.size.height
          break;
        case 'south':
          chamber.position.left = first_passage.position.left + Math.ceil(Math.random() * chamber.size.width) - chamber.size.width
          chamber.position.top = first_passage.position.top + 1
          break;
        case 'west':
          chamber.position.left = first_passage.position.left - chamber.size.width
          chamber.position.top = first_passage.position.top + Math.ceil(Math.random() * chamber.size.height) - chamber.size.height
          break;
      }
    } else {
      console.log('addChamber() has not been passed an argument')
    }
    chambers.push(chamber)
  }

  function addPassages(chamber){
    if (!chamber){
      console.log('You must pass a chamber to addPassage()')
    } else {

      for (let h=0; h<Math.ceil(Math.random() * max_passages_per_chamber); h++){
        let passage = {
          id: passages.length,
          chambers: [chamber.id],
          type: passage_types[Math.floor(Math.random() * passage_types.length)],
          direction: directions[Math.floor(Math.random() * directions.length)],
          position: {
            left: chamber.position.left,
            top: chamber.position.top
          }
        }
        function setPassagePosition(){
          switch (passage.direction) {
            case 'north':
              passage.position.left = chamber.position.left + Math.floor(Math.random() * chamber.size.width)
              passage.position.top = chamber.position.top
              break;
            case 'east':
              passage.position.left = chamber.position.left + chamber.size.width-1
              passage.position.top = chamber.position.top + Math.floor(Math.random() * chamber.size.height)
              break;
            case 'south':
              passage.position.left = chamber.position.left + Math.floor(Math.random() * chamber.size.width)
              passage.position.top = chamber.position.top + chamber.size.height-1
              break;
            case 'west':
              passage.position.left = chamber.position.left
              passage.position.top = chamber.position.top + Math.floor(Math.random() * chamber.size.height)
              break;
          }
          if (passages.length > 0){
            let passage_clone = false
            for (let i=0; i<passages.length; i++){
              if (passage.direction == passages[i].direction && passage.position.left == passages[i].position.left && passage.position.top == passages[i].position.top){
                passage_clone = true
              }
              switch (passage.direction) {
                case 'north':
                  if (passages[i].direction == 'south' && passage.position.left == passages[i].position.left && passage.position.top-1 == passages[i].position.top){
                    passage_clone = true
                  }
                  break;
                case 'east':
                  if (passages[i].direction == 'west' && passage.position.left+1 == passages[i].position.left && passage.position.top == passages[i].position.top){
                    passage_clone = true
                  }
                  break;
                case 'south':
                  if (passages[i].direction == 'north' && passage.position.left == passages[i].position.left && passage.position.top+1 == passages[i].position.top){
                    passage_clone = true
                  }
                  break;
                  case 'west':
                    if (passages[i].direction == 'east' && passage.position.left-1 == passages[i].position.left && passage.position.top == passages[i].position.top){
                      passage_clone = true
                    }
                    break;
              }
            }
            if (passage_clone){
              passage.direction = directions[Math.floor(Math.random() * directions.length)]
              setPassagePosition()
              return;
            }
          }
        }
        setPassagePosition()
        passages.push(passage)
        chamber.passages.push(passage.id)
      }
    }
  }

  function renderChambers(){
    for (let i=0; i<chambers.length; i++){
      const this_chamber = chambers[i]
      $map.append('<div id="chamber-'+this_chamber.id+'" class="chamber" style="width: '+this_chamber.size.width+'em; height: '+this_chamber.size.height+'em; left: '+this_chamber.position.left+'em; top: '+this_chamber.position.top+'em"></div>')
      $map.append('<div class="chamber-number" style="left: '+(this_chamber.position.left + Math.floor(this_chamber.size.width/2))+'em; top: '+(this_chamber.position.top + Math.floor(this_chamber.size.height/2))+'em;"><p>'+(this_chamber.id+1)+'</p></div>')
    }
  }

  function renderPassages(){
    for (let i=0; i<passages.length; i++){
      if (passages[i] != undefined){
        let passage = passages[i]
        let markup = '<div id="passage-'+passage.id+'" class="passage '+passage.type+' '+passage.direction+'" style="'
        switch (passage.direction) {
          case 'north':
            markup += 'left: '+(passage.position.left + 0.5)+'em; top: '+passage.position.top+'em;'
            break;
          case 'east':
            markup += 'left: '+(passage.position.left + 1)+'em; top: '+(passage.position.top + 0.5)+'em;'
            break;
          case 'south':
            markup += 'left: '+(passage.position.left + 0.5)+'em; top: '+(passage.position.top + 1)+'em;'
            break;
          case 'west':
            markup += 'left: '+passage.position.left+'em; top: '+(passage.position.top + 0.5)+'em;'
            break;
        }
        markup += '">'
        if (passage.type == 'secret door'){
          markup += '<p>s</p>'
        }
        markup += '</div>'
        $map.append(markup)
      }
    }
  }

  function renderGrid(){
    $map.append('<div class="grid"></div>')
      for (let i=0; i<map_width; i++){
        for (let j=0; j<map_height; j++){
          $('.grid').append('<div class="square x-'+i+' y-'+j+'" style="left: '+i+'em; top: '+j+'em;"></div>')
        }
      }
  }

  for (let h=0; h<3; h++){
    if (chambers.length == 0){
      addChamber()
      addPassages(chambers[chambers.length-1])
    } else {
      for (let i=0; i<passages.length; i++){
        if (passages[i].chambers.length < 2){
          if (chambers.length < max_chambers) {
            addChamber(passages[i])
            addPassages(chambers[chambers.length-1])
          }
        }
      }
    }
  }
  for (let i=0; i<passages.length; i++){
    if (passages[i].chambers.length < 2){
      delete passages[i]
    }
  }

  renderChambers()
  renderPassages()
  renderGrid()
  console.log(chambers)
  console.log(passages)

});
