$( document ).ready(function(){

  const $map = $('.map')
  const $grid = $('.grid')
  const directions = ['north','east','south','west'];

  let grid_size = parseInt($map.css('font-size'))
  let map_width = Math.floor($map.width() / grid_size)
  let map_height = Math.floor($map.height() / grid_size)
  let map_margin_left = ($map.width() % grid_size)/2
  let map_margin_top = ($map.height() % grid_size)/2
  $map.width(map_width * grid_size)
  $map.height(map_height * grid_size)
  $map.css('margin','map_margin_top map_margin_left')

  console.log()

  let sections = []

  function startingArea(){
    sections.push(
      {
        size: {
          height: 4,
          width: 3
        },
        position: {
          left: Math.floor(map_width/2),
          top: Math.floor(map_height/2)
        },
        walls: {
          north: 'secret door',
          east: 'door',
          south: 'door',
          west: 'door'
        }
      }
    )
  }

  function addSection(previous_chamber, direction){
    if (previous_chamber && direction){
      const height = 3
      const width = 5
      let left, top = null
      let north, south, east, west = null
      if (Math.random() > 0.5) {
        north = 'door'
        if (Math.random() > 0.5) {
          north = 'secret door'
        }
      }
      switch (direction) {
        case 'north':
          left = (previous_chamber.position.left + Math.floor(previous_chamber.size.width/2)) - Math.floor(width/2)
          top = previous_chamber.position.top - height
          south = previous_chamber.walls.north
          break;
        case 'east':
          left = previous_chamber.position.left + previous_chamber.size.width
          top = (previous_chamber.position.top + Math.floor(previous_chamber.size.height/2)) - Math.floor(height/2)
          west = previous_chamber.walls.east
          break;
        case 'south':
          left = (previous_chamber.position.left + Math.floor(previous_chamber.size.width/2)) - Math.floor(width/2)
          top = previous_chamber.position.top + previous_chamber.size.height
          north = previous_chamber.walls.south
          break;
        case 'west':
          left = previous_chamber.position.left - width
          top = (previous_chamber.position.top + Math.floor(previous_chamber.size.height/2)) - Math.floor(height/2)
          east = previous_chamber.walls.west
          break;
        default:

      }
      sections.push(
        {
          size: {
            height: height,
            width: width
          },
          position: {
            left: left,
            top: top
          },
          walls: {
            north: north,
            east: south,
            south: east,
            west: west
          }
        }
      )
    } else {
      console.log("You must pass addChamber an existing chamber and a direction")
    }
  }

  function renderSections(){
    for (let i=0; i<sections.length; i++){
      let this_section_index = i
      let this_section = sections[this_section_index]
      $map.prepend('<div class="chamber chamber-'+this_section_index+'" style="width: '+this_section.size.width+'em; height: '+this_section.size.height+'em; left: '+this_section.position.left+'em; top: '+this_section.position.top+'em"></div>');
      for (const entry of Object.entries(this_section.walls)){
        if (entry[1] != null){
          let markup = '<div class="'+entry[0]+' '+entry[1]+'" style="'
          switch (entry[0]) {
            case 'north':
              markup += 'left: '+Math.floor(this_section.size.width/2)+'em;'
              break;
            case 'east':
              markup += 'top: '+Math.floor(this_section.size.height/2)+'em;'
              break;
            case 'south':
              markup += 'left: '+Math.floor(this_section.size.width/2)+'em;'
              break;
            case 'west':
              markup += 'top: '+Math.floor(this_section.size.height/2)+'em;'
              break;
            default:

          }
          markup += '">'
          if (entry[1] == 'secret door'){
            markup += 's'
          }
          markup += '</div>'
          $('.chamber-'+this_section_index).append(markup)
        }
      }
    }
  }

  function renderGrid(){
    for (let i=0; i<map_width; i++){
      for (let j=0; j<map_height; j++){
        $grid.append('<div class="square" style="left: '+i+'em; top: '+j+'em;"></div>')
      }
    }
  }

  startingArea()
  let this_section = sections[sections.length-1]
  for (const entry of Object.entries(this_section.walls)){
    if (entry[1] != null){
      console.log(entry[1])
      addSection(this_section, entry[0])
    }
  }
  renderSections()
  renderGrid()

});
