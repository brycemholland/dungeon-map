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

  function createTiles(){
    for (let x=0; x<map_width; x++){
      for (let y=0; y<map_height; y++){
        $map.append('<div id="tile-'+x+'-'+y+'" class="tile outside" data-chamber="null" data-passage="null" style="left: '+x+'em; top: '+y+'em;"></div>')
      }
    }
  }

  function getPosition($tile){
    if ($tile){
      const id_string = $tile.attr('id')
      let dash_indexes = []
      for (let i=0; i<id_string.length; i++){
        if (id_string[i] == '-'){
          dash_indexes.push(i)
        }
      }
      return {
        x: $tile.attr('id').substr(dash_indexes[0]+1, (dash_indexes[1]-1) - dash_indexes[0]),
        y: $tile.attr('id').substr(dash_indexes[1]+1, (id_string.length-1) - dash_indexes[1])
      }
    } else {
      console.log('You must pass a tile to getPosition()')
    }
  }

  function getNeighborTiles($home_tile){
    const x = getPosition($home_tile).x
    const y = getPosition($home_tile).y
    console.log($('#tile-'+(x+1)+'-'+y+''))
    const neighbor_array = [
      {direction: 'north', opposite_direction: 'south', $tile: $('#tile-'+x+'-'+(y-1)+'')},
      {direction: 'east', opposite_direction: 'west', $tile: $('#tile-'+(x+1)+'-'+y+'')},
      {direction: 'south', opposite_direction: 'north', $tile: $('#tile-'+x+'-'+(y+1)+'')},
      {direction: 'west', opposite_direction: 'east', $tile: $('#tile-'+(x-1)+'-'+y+'')}
    ]
    return neighbor_array
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
          const $this_tile = $('#tile-'+x+'-'+y)
          if ($this_tile.hasClass('inside') && $this_tile.attr('data-chamber') != this_chamber.id){
            break
          } else {
            $this_tile.addClass('inside').removeClass('outside').attr('data-chamber', this_chamber.id)

            const neighbor_tiles = getNeighborTiles($this_tile)
            for (let i=0; i<neighbor_tiles.length; i++){
              const this_neighbor = neighbor_tiles[i]
              if (this_neighbor.$tile.attr('data-chamber') != this_chamber.id){
                $this_tile.addClass('wall-'+this_neighbor.direction)
              } else if (this_neighbor.$tile.attr('data-chamber') == this_chamber.id){
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
          const neighbor_tiles = getNeighborTiles($this_tile)

          for (let j=0; j<neighbor_tiles.length; j++){
            const this_neighbor = neighbor_tiles[j]
            if (this_neighbor.$tile.attr('data-chamber') != this_chamber.id){
              if (this_neighbor.$tile.attr('data-passage') != this_neighbor.opposite_direction){
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
              position: {
                left: getPosition($this_tile).x,
                top: getPosition($this_tile).y
              }
            }
            this_chamber.passages.push(passage)
            $this_tile.attr('data-passage', passage.direction).append('<div class="passage '+passage.direction+' '+passage.type+'"></div>')
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

 $map.delay(1000).queue(function() {
     $map.dequeue();
  });
  console.log(chambers)

})
