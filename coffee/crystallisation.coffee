
# ----------------------------------------
# Vertex
# ----------------------------------------

class Vertex

    constructor: ( @x = 0.0, @y = 0.0 ) ->

    # squared distance to another vertex
    distanceSq: ( v ) -> (dx = v.x - @x) * dx + (dy = v.y - @y) * dy

    # distance to another vertex
    distance: ( v ) -> sqrt (dx = v.x - @x) * dx + (dy = v.y - @y) * dy
    
    # radian angle to another vertex
    angle: ( v ) -> atan2 v.y - @y, v.x - @x

    # linear interpolation between this and another vertex
    lerp: ( v, f ) -> new Vertex @x + (v.x - @x) * f, @y + (v.y - @y) * f

    # duplicate this vertex
    clone: -> new Vertex @x, @y

# ----------------------------------------
# Line
# ----------------------------------------

class Line

    constructor: ( @start, @end ) ->

# ----------------------------------------
# Polygon
# ----------------------------------------

class Polygon

    constructor: ( @vertices... ) ->

        # assign principal generation
        @generation = 0

        # unique lines
        @unique = []

    # subdivides this polygon into 2 and returns both
    subdivide: ( randomness = 0.0, opposite = 0.5 ) ->

        # current number of sides
        nv = @vertices.length

        # choose two unique indices
        i1 = ~~random nv
        i2 = if do random < opposite then ~~(i1 + nv / 2) % nv else ~~random nv
        i2 = ~~random nv while i2 is i1

        # choose lerp points
        l1 = 0.5 + random randomness * -0.5, randomness * 0.5
        l2 = 0.5 + random randomness * -0.5, randomness * 0.5

        # create new vertices as linear interpolations between adjacent
        v1 = @vertices[i1].lerp @vertices[(i1 + 1) % nv], l1
        v2 = @vertices[i2].lerp @vertices[(i2 + 1) % nv], l2

        # winding iterators
        [j1, j2] = [i1, i2]

        # first polygon winds clockwise from v1 to v2
        p1 = new Polygon v1
        p1.vertices.push @vertices[ j1 = (j1 + 1) % nv ] while j1 isnt i2
        p1.vertices.push v2

        # second polygon winds clockwise from v2 to v1
        p2 = new Polygon v2
        p2.vertices.push @vertices[ j2 = (j2 + 1) % nv ] while j2 isnt i1
        p2.vertices.push v1

        # increment generations
        p1.generation = @generation + 1
        p2.generation = @generation + 1

        # store this unique line only
        p1.unique.push new Line v1, v2
        
        # return new polygons
        [p1, p2]

    # computes the centroid point
    centroid: ->

        # centroid points
        cx = cy = 0.0

        # sum all vertices
        (cx += vertex.x; cy += vertex.y) for vertex in @vertices

        # take an average as the centroid
        new Vertex cx / @vertices.length, cy / @vertices.length

    # computes the minimum angle between vertices
    minAngle: ->

        # cosine rule (SSS) a^2 = b^2 + c^2 - 2bc cos A
        rule = (a, b, c) -> Math.acos (a*a + b*b - c*c) / (2*a*b)

        val = Number.MAX_VALUE
        len = @vertices.length

        # build triangles from vertices
        for vertex, index in @vertices
            
            # next / previous vertices in loop
            prev = @vertices[ (index - 1 + len) % len ]
            next = @vertices[ (index + 1 + len) % len ]

            # compute triangle sides
            a = prev.distance vertex
            b = next.distance vertex
            c = next.distance prev

            # compute angles
            A = rule b, c, a
            B = rule c, a, b
            C = Math.PI - A - B

            # store the lowest
            val = min val, C

        val

    # computes the minimum side length
    minSide: ->
        
        side = Number.MAX_VALUE
        prev = @vertices[ @vertices.length - 1 ]
        (side = min side, vertex.distanceSq prev; prev = vertex) for vertex in @vertices
        sqrt side

    # computes the perimeter of this polygon
    perimeter: ->

        result = @vertices[0].distance @vertices[ @vertices.length - 1 ]
        @vertices.reduce ( a, b ) -> result += a.distance b; a = b
        result

    # draws this polygon to a given context
    draw: ( ctx ) ->
        
        ctx.fillStyle = '#fff'
        ctx.strokeStyle = '#000'
        ctx.lineWidth = 0.5

        do ctx.beginPath
        
        vertex = @vertices[0]
        
        ctx.moveTo vertex.x, vertex.y
        ctx.lineTo vertex.x, vertex.y for vertex in @vertices
        
        do ctx.closePath
        do ctx.fill
        do ctx.stroke
                
# ----------------------------------------
# Main
# ----------------------------------------

crystallisation = Sketch.create

    # configurable
    settings:
        iterations: 50
        randomness: 0.25
        opposite: 0.1
        minAngle: 0.4
        minSide: 2

    # custom properties
    polygons: []
    lines: []
    
    # sketch.js settings
    container: document.getElementById 'container'
    autoclear: no
    interval: 1
    
    # sketch.js setup
    setup: -> do @reset    
    
    # subdivides next polygon
    step: ->

        # choose a polygon to subdivide
        index = ~~random @polygons.length - 1

        # subdivide the polygon
        slices = @polygons[ index ].subdivide @settings.randomness, @settings.opposite

        # check whether all slices are usable
        ((drop = yes; break) if do slice.minAngle < @settings.minAngle) for slice in slices
        ((drop = yes; break) if do slice.minSide < @settings.minSide) for slice in slices

        # if all slices are usable
        if not drop?

            # remember unique lines from the chosen polygons
            (@lines.push line) for line in @polygons[ index ].unique

            # draw and store the slices
            (@polygons.push slice; slice.draw @) for slice in slices

            # remove the original polygon
            @polygons.splice index, 1

    # clears polygons to a single rectangle
    reset: ->
    
        # initial bounding box points
        a = new Vertex 0, 0
        b = new Vertex @width, 0
        c = new Vertex @width, @height
        d = new Vertex 0, @height
        
        # initial bounding polygon
        @polygons = [ new Polygon a, b, c, d ]

        # clear stored lines
        @lines = []
        
        do @clear
    
    # toggle update loop          
    toggle: -> do (if @running then @stop else @start)
    
    # sketch.js update loop
    draw: -> do @step for i in [0..@settings.iterations]

    # save output as an image
    save: -> window.open do @canvas.toDataURL, 'subdivide', "top=20,left=20,width=#{@width},height=#{@height}"
      
# ----------------------------------------
# GUI
# ----------------------------------------

gui = new dat.GUI()
gui.add( crystallisation.settings, 'minSide' ).min( 0 ).max( 100 ).name 'min side length'
gui.add( crystallisation.settings, 'minAngle' ).min( 0.0 ).max( 1.2 ).step( 0.01 ).name 'min angle (rad)'
gui.add( crystallisation.settings, 'iterations' ).min( 1 ).max( 100 )
gui.add( crystallisation.settings, 'randomness' ).min( 0.0 ).max( 1.0 ).step( 0.01 )
gui.add( crystallisation.settings, 'opposite' ).min( 0.0 ).max( 1.0 ).step( 0.01 ).name 'opposite sides'
gui.add( crystallisation, 'toggle' ).name 'start / stop'
gui.add( crystallisation, 'reset' ).name 'reset polygons'
gui.add( crystallisation, 'clear' ).name 'clear canvas'
gui.add( crystallisation, 'save' ).name 'save'
