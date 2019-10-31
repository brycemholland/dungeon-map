$(document).ready(function(){

  const $map = $('.map')
  const directions = ['north','east','south','west']
  const passage_types = ['open','door','secret door']
  const max_passages_per_chamber = 4

  let grid_size = parseInt($map.css('font-size'))
  let map_width = Math.floor($map.width() / grid_size)
  let map_height = Math.floor($map.height() / grid_size)
  $map.width(map_width * grid_size)
  $map.height(map_height * grid_size)

  let chambers = []
  let tile_count = 0

  function createTiles(){
    for (let x=0; x<map_width; x++){
      for (let y=0; y<map_height; y++){
        $map.append('<div id="tile-'+tile_count+'" class="tile outside" position="{left: '+x+', top: '+y+'}" style="left: '+x+'em; top: '+y+'em;"></div>')
      }
    }
  }

  function getNeighborTiles($home_tile){
    const x = $home_tile.data('position').left
    const y = $home_tile.data('position').top
    return [
      {direction: 'north', opposite_direction: 'south', $tile: $('.tile').data('position', '{left: x, top: y-1}')},
      {direction: 'east', opposite_direction: 'west', $tile: $('.tile').data('position', '{left: x+1, top: y}')},
      {direction: 'south', opposite_direction: 'north', $tile: $('.tile').data('position', '{left: x, top: y+1}')},
      {direction: 'west', opposite_direction: 'east', $tile: $('.tile').data('position', '{left: x-1, top: y}')},
    ]
  }

  function addChamber(first_passage){
    let chamber = {
      id: chambers.length,
      position: {
        left: Math.floor(map_width/2),
        top: Math.floor(map_height/2)
      },
      size: {
        max_height: Math.ceil(Math.random()*5),
        max_width: Math.ceil(Math.random()*5)
      },
      passages: []
    }
    if (first_passage){
      first_passage.chambers.push(chamber.id)
      switch (first_passage.direction) {
        case 'north':
          chamber.position.left = first_passage.position.left - chamber.size.max_width + Math.ceil(Math.random() * chamber.size.max_width)
          chamber.position.top = first_passage.position.top - chamber.size.height
          break;
        case 'east':
          chamber.position.left = first_passage.position.left + 1
          chamber.position.top = first_passage.position.top - chamber.size.max_height + Math.ceil(Math.random() * chamber.size.max_height)
          break;
        case 'south':
          chamber.position.left = first_passage.position.left - chamber.size.max_width + Math.ceil(Math.random() * chamber.size.max_width)
          chamber.position.top = first_passage.position.top + 1
          break;
        case 'west':
          chamber.position.left = first_passage.position.left - chamber.size.width
          chamber.position.top = first_passage.position.top - chamber.size.max_height + Math.ceil(Math.random() * chamber.size.max_height)
          break;
      }
    }
    chambers.push(chamber)
  }

  function setChamberTiles(this_chamber){
    if (this_chamber) {
      const max_chamber_height = this_chamber.size.max_height
      const max_chamber_width = this_chamber.size.max_width
      for (let x=this_chamber.position.left; x<(this_chamber.position.left + max_chamber_width); x++){
        for (let y=this_chamber.position.top; y<(this_chamber.position.top + max_chamber_height); y++){
          const $this_tile = $('.tile').data('position', '{left: x, top: y}')
          console.log($this_tile)
          if ($this_tile.hasClass('inside') && $this_tile.data('chamber') != this_chamber.id){
            break
          } else {
            $this_tile.addClass('inside').removeClass('outside').data('chamber', this_chamber.id)

            const neighbor_tiles = getNeighborTiles($this_tile)
            for (let i=0; i<neighbor_tiles.length; i++){
              const this_neighbor = neighbor_tiles[i]
              if (this_neighbor.$tile.data('chamber') != this_chamber.id){
                $this_tile.addClass('wall-'+this_neighbor.direction)
              } else if (this_neighbor.$tile.data('chamber') == this_chamber.id){
                this_neighbor.$tile.removeClass('wall-'+this_neighbor.opposite_direction)
              }
            }
          }
        }
      }
    } else {
      console.log('You must pass a chamber to setChamberTiles()')
    }
  }

  function addPassages(this_chamber){
    if (this_chamber){
      let passage_count = 0
      const chamber_tiles = $('.tile[data-chamber="'+this_chamber.id+'"]')

      for (let i=0; i<chamber_tiles.length; i++){

        if (passage_count < max_passages_per_chamber){
          const $this_tile = chamber_tiles.eq(i)
          let available_directions = []
          const neighbor_tiles = getNeighborTiles(chamber_tiles.eq(i))

          for (let j=0; j<neighbor_tiles.length; j++){
            const this_neighbor = neighbor_tiles[j]
            console.log(this_neighbor.$tile.data('chamber'))
            if (this_neighbor.$tile.data('chamber') != this_chamber.id){
              if (this_neighbor.$tile.data('passage') != this_neighbor.opposite_direction){
                available_directions.push(this_neighbor.direction)
              } else {
                // push this chamber to the neighbor chamber's passages "other_chamber"
              }
            }
          }

          if (available_directions.length > 0){
            const passage = {
              type: passage_types[Math.floor(Math.random() * passage_types.length)],
              direction: available_directions[Math.floor(Math.random() * available_directions.length)],
              other_chamber: null,
              position: {
                left: $this_tile.data('position').left,
                top: $this_tile.data('position').top
              }
            }
            this_chamber.passages.push(passage)
            $this_tile.data('passage', passage.direction).append('<div class="passage '+passage.direction+' '+passage.type+'"></div>')
            passage_count++
          }
        }
      }
    } else {
      console.log('You must pass a chamber to addPassage()')
    }
  }

  function addDetails(){
    const open_passages = $('.passage.open')
    for (let i=0; i<open_passages.length; i++){
      open_passages.eq(i).append('<span></span>')
    }

    const secret_passages = $('.passage.door.secret')
    for (let i=0; i<secret_passages.length; i++){
      secret_passages.eq(i).append('<p>s</p>')
    }
  }

  createTiles()
  addChamber()
  setChamberTiles(chambers[0])
  addPassages(chambers[0])
  addDetails()
  console.log(chambers)

})
