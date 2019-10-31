$(document).ready(function(){

  const $map = $('.map')
  const directions = ['north','east','south','west']
  const passage_types = ['open','door','secret door']
  const number_of_chambers = 2
  const max_passages_per_chamber = 4

  let grid_size = parseInt($map.css('font-size'))
  let map_width = Math.floor($map.width() / grid_size)
  let map_height = Math.floor($map.height() / grid_size)
  $map.width(map_width * grid_size)
  $map.height(map_height * grid_size)

  let tiles = []
  let chambers = []

  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function createTiles(){
    for (let x=0; x<map_width; x++){
      for (let y=0; y<map_height; y++){
        tiles.push({
          id: tiles.length,
          position: {
            left: x,
            top: y
          },
          chamber: null,
          passages: [],
          walls: []
        })
      }
    }
  }

  function getNeighborTiles(home_tile){
    const x = home_tile.position.left
    const y = home_tile.position.top
    const neighbor_tiles = {
      north: tiles.filter(tile => (tile.position.left == x) && (tile.position.top == (y-1)))[0],
      east: tiles.filter(tile => (tile.position.left == (x+1)) && (tile.position.top == y))[0],
      south: tiles.filter(tile => (tile.position.left == x) && (tile.position.top == (y+1)))[0],
      west: tiles.filter(tile => (tile.position.left == (x-1)) && (tile.position.top == y))[0]
    }
    const neighbor_array = [
      {direction: 'north', opposite_direction: 'south', object: neighbor_tiles.north},
      {direction: 'east', opposite_direction: 'west', object: neighbor_tiles.east},
      {direction: 'south', opposite_direction: 'north', object: neighbor_tiles.south},
      {direction: 'west', opposite_direction: 'east', object: neighbor_tiles.west}
    ]
    return neighbor_array
  }

  function addChamber(passage_tile){
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
      tiles: [],
      passages: []
    }
    if (passage_tile){
      passage_tile.chambers.push(chamber.id)
      switch (passage_tile.direction) {
        case 'north':
          chamber.position.left = passage_tile.position.left - chamber.size.max_width + Math.ceil(Math.random() * chamber.size.max_width)
          chamber.position.top = passage_tile.position.top - chamber.size.max_height
          break;
        case 'east':
          chamber.position.left = passage_tile.position.left + 1
          chamber.position.top = passage_tile.position.top - chamber.size.max_height + Math.ceil(Math.random() * chamber.size.max_height)
          break;
        case 'south':
          chamber.position.left = passage_tile.position.left - chamber.size.max_width + Math.ceil(Math.random() * chamber.size.max_width)
          chamber.position.top = passage_tile.position.top + 1
          break;
        case 'west':
          chamber.position.left = passage_tile.position.left - chamber.size.max_width
          chamber.position.top = passage_tile.position.top - chamber.size.max_height + Math.ceil(Math.random() * chamber.size.max_height)
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
          const this_tile = tiles.filter(tile => tile.position.left == x && tile.position.top == y)[0]
          if (this_tile.chamber != this_chamber.id && this_tile.chamber != null){
            break
          } else {
            this_chamber.tiles.push(this_tile.id)
            this_tile.chamber = this_chamber.id

            const neighbor_tiles = getNeighborTiles(this_tile)
            for (let i=0; i<neighbor_tiles.length; i++){
              const this_neighbor = neighbor_tiles[i]
              if (this_neighbor.object.chamber == this_chamber.id){
                let walls_to_keep = []
                for (let j=0; j<this_neighbor.object.walls.length; j++){
                  if (this_neighbor.object.walls[j] != this_neighbor.opposite_direction){
                    walls_to_keep.push(this_neighbor.object.walls[j])
                  }
                }
                this_neighbor.object.walls = walls_to_keep
              } else {
                this_tile.walls.push(this_neighbor.direction)
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
      const max_passages = Math.ceil(Math.random() * max_passages_per_chamber)
      const chamber_tiles = shuffle(tiles.filter(tile => tile.chamber == this_chamber.id))

      for (let i=0; i<chamber_tiles.length; i++){
        if (passage_count < max_passages){
          const this_tile = chamber_tiles[i]
          let available_directions = []
          const neighbor_tiles = getNeighborTiles(this_tile)

          for (let j=0; j<neighbor_tiles.length; j++){
            const this_neighbor = neighbor_tiles[j]
            if (this_neighbor.object.chamber != this_chamber.id){
              if (this_neighbor.object.passages.length > 0){
                for (let k=0; k<this_neighbor.object.passages.length; k++){
                  if (this_neighbor.object.passages[k] != this_neighbor.opposite_direction){
                    available_directions.push(this_neighbor.direction)
                  }
                }
              } else {
                available_directions.push(this_neighbor.direction)
              }
            }
          }

          if (available_directions.length > 0){
            const passage_direction = available_directions[Math.floor(Math.random() * available_directions.length)]
            this_tile.passages.push(passage_direction)
            passage_count++
          }
        }
      }
    } else {
      console.log('You must pass a chamber to addPassage()')
    }
  }

  function appendToDOM(){
    tiles.forEach(function(tile){
      if (tile.chamber != null){
        $map.append('<div id="tile-'+tile.id+'" class="tile inside" style="left: '+tile.position.left+'em; top: '+tile.position.top+'em;"></div>')
        $this_tile = $('#tile-'+tile.id)
        tile.walls.forEach(function(wall){
          $this_tile.addClass('wall-'+wall)
        })
        tile.passages.forEach(function(passage){
          $this_tile.append('<div class="passage '+passage+' '+passage_types[Math.floor(Math.random() * passage_types.length)]+'"></div>')
        })
      }
    })

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
  appendToDOM()
  console.log(chambers)

})
