	function Particle(x, y, m){
		this.x = x;
		this.y = y;
		this.rgb = [0,0,0];
		var angle = Math.random()*2*Math.PI;
	
		this.dx = m * Math.cos(angle);
		this.dy = m * Math.sin(angle);
	
		this.update = function(){
			var idx = (Math.floor(this.x) + Math.floor(this.y) * Math.floor(width)) * 4;
			terrain_data[idx+3] = 0;
			this.x+=this.dx;
			this.y+=this.dy;
		
		};
		this.draw = function(){
			var idx = (Math.floor(this.x) + Math.floor(this.y) * Math.floor(width)) * 4;
			terrain_data[idx] = this.rgb[0];
			terrain_data[idx+1] = this.rgb[1];
			terrain_data[idx+2] = this.rgb[2];
			terrain_data[idx+3] = 255;
		};
		
	}
	
	function Emitter(x, y, size){
		this.x = x;
		this.y = y;
		this.size = size;
		this.particles = [];
		for(var i=0;i<100;i++){
			this.particles.push(new Particle(x,y, size));
		}
		this.update = function(){
			for(var i=0;i<100;i++){
				this.particles[i].update();
			}
		};
		this.draw = function(){
			for(var i=0;i<100;i++){
				this.particles[i].draw();
			}
		};
	}


function Player(ctx){
	this.ctx = ctx;
	var guy_array = [[ 0, 0, 1, 1, 0, 0 ],
					 [ 0, 0, 1, 1, 0, 0 ],
					 [ 0, 1, 1, 1, 1, 0 ],
					 [ 0, 0, 1, 1, 0, 0 ],
					 [ 0, 0, 1, 1, 0, 1 ],
					 [ 1, 1, 1, 1, 1, 1 ],
					 [ 1, 0, 1, 1, 0, 0 ],
					 [ 1, 0, 1, 1, 0, 0 ],
					 [ 0, 0, 1, 1, 1, 0 ],
					 [ 0, 0, 1, 0, 1, 0 ],
					 [ 1, 1, 1, 0, 1, 0 ],
					 [ 1, 0, 0, 0, 1, 1 ]];
	this.width = guy_array[0].length;
	this.height = guy_array.length;
	this.guy_right = ctx.createImageData(this.width, this.height);
	this.guy_left = ctx.createImageData(this.width, this.height);
	for (var y = 0; y < this.guy_right.height; y++) {
		for (var x = 0; x < this.guy_right.width; x++) {
			var idx = (x + y * this.guy_right.width) * 4;
			var idx_left = ((this.guy_right.width-1-x) + y * this.guy_right.width) * 4;
			this.guy_right.data[idx] = 0;
			this.guy_right.data[idx+1] = 0;
			this.guy_right.data[idx+2] = 0;
			this.guy_right.data[idx+3] = guy_array[y][x] * 255;
			this.guy_left.data[idx_left] = 0;
			this.guy_left.data[idx_left+1] = 0;
			this.guy_left.data[idx_left+2] = 0;
			this.guy_left.data[idx_left+3] = guy_array[y][x] * 255;
		}
	}	
	this.x = 0;
	this.y = 0;
	this.dx = 0;
	this.dy = 0;
	this.last_x = 0;
	this.last_y = 0;
	this.moved = true;
	this.left = 0;
	this.right = 0;
	this.up = 0;
	this.down = 0;

	this.facing_right = true;
	this.floor = false;

	this.update = function(terrain){
		this.last_y = this.y;
		this.last_x = this.x;

		//gravity
		this.down+=1;

		var move_left = this.left; var move_right = this.right;
		var move_down = this.down; var move_up = this.up;

		this.floor = false;
		var j;
		for(y = this.y+this.height, j =0; y < this.y+this.height+this.down; y++, j++){
			for(var i = 0; i < this.width; i++){		
				var x = this.x+i; 
				var idx = (x + y * terrain.width) * 4;
				if(terrain.data[idx+3]){
					this.floor = true;
					move_down =0;
					break;
				}
			}	
		}

		//left and right
		if(this.left || this.right){
			var x_left = this.x;
			var x_right = this.x+this.width;
			for(i = 0; i < this.height; i++){
				y = this.y+i; 
				var idx_left = (x_left + y * terrain.width) * 4;
				var idx_right = (x_right + y * terrain.width) * 4;
				if(terrain.data[idx_left+3]){
					move_left = 0;
				}
				if(terrain.data[idx_right+3]){
					move_right = 0;
				}
			}
		}

		if(this.left > this.right){
			this.facing_right = false;
		}

		else if(this.left < this.right){
			this.facing_right = true;
		}

		if(this.left || this.right){
			this.x += move_right - move_left;
			this.moved = true;
		}

		if(this.up){
			this.y-= this.up;
			this.up--;
			if(this.up < 0) this.up = 0;
			move_down = 0;
		}
		
		if(move_down){
			this.y+= move_down;
		}
		else{
			this.down = 0;
		}
		
	};
	this.draw = function(){
		if(this.moved){
			this.ctx.clearRect(this.last_x, this.last_y,  this.width, this.height);
			if(this.facing_right)
				this.ctx.putImageData(this.guy_right, this.x, this.y);
			else
				this.ctx.putImageData(this.guy_left, this.x, this.y);
		}
	};

	this.move_left = function(on){
		if(!on) this.left = 0;
		else if(!this.left){
			this.left+=2;
		}
		
	};
	
	this.move_right = function(on){
		if(!on) this.right = 0;
		else if(!this.right){
			this.right+=2;
		}
	};
	
	this.move_up = function(on){
		if(!this.up && this.floor){
			this.up+=10;
		}
	};
}


function setup(){
	function relMouseCoords(event){
		var totalOffsetX = 0;
		var totalOffsetY = 0;
		var canvasX = 0;
		var canvasY = 0;
		var currentElement = this;
		do{
			totalOffsetX += currentElement.offsetLeft;
			totalOffsetY += currentElement.offsetTop;
		}
		while(currentElement = currentElement.offsetParent);
		canvasX = event.pageX - totalOffsetX;
		canvasY = event.pageY - totalOffsetY;
		return {x:canvasX, y:canvasY};
	}
	HTMLCanvasElement.prototype.relMouseCoords = relMouseCoords;

}

function init(){
	setup();
	var terrain_canvas = document.getElementById('terrain');
	var terrain_ctx = terrain_canvas.getContext('2d'); 
	var player_canvas = document.getElementById('players');
	var player_ctx = player_canvas.getContext('2d'); 	
	var requestAnimationFrame = window.requestAnimationFrame || 
		 window.mozRequestAnimationFrame ||  
         window.webkitRequestAnimationFrame || 
		 window.msRequestAnimationFrame;  

	function step(timestamp) {  
		update();
		tick++;
		requestAnimationFrame(step);  
	}  

	requestAnimationFrame(step);
	 

	var tick = 0;
	var terrain = terrain_ctx.createImageData(terrain_canvas.width, terrain_canvas.height);
	var width = terrain.width, height = terrain.height;
	var terrain_data = terrain.data;
	var terrain_floor = []; terrain_floor.length = width;
	var terrain_change = true;
	var first_draw = true;
	var update_regions = [];	
	
	var particles = [];
	var gravity = [0, 1];
	var wind = [0, 0];
	var windavity = [0, 1];

	function update(){
		if(terrain_change || update_regions.length || particles.length){	
			windavity = [gravity[0]+wind[0], gravity[1]+wind[1]];
			//collapse();
			update_particles();
			terrain_draw();
			terrain_change = false;
		}
	}


	function terrain_draw(){
		if(first_draw){
			for (var y = 0; y < height; y++) {
				for (var x = 0; x < width; x++) {			
					var idx = (x + y * width) * 4;
					var value = 255 - (y/height)*255;
					var alpha = 255;
					if(y< height/2.0 + 11*Math.sin(x/31) + 51*Math.sin(x/83) + Math.sin(x/5) * Math.sin(x/20)){
						alpha = 0;
					}
					terrain_data[idx] = value;
					terrain_data[idx + 1] = value;
					terrain_data[idx + 2] = value;
					terrain_data[idx + 3] = alpha;
				}
			}
			first_draw = false;
		}
		terrain_ctx.putImageData(terrain, 0, 0);
	}
	
	function blow_hole(x,y,r){
		for(var y_ = y-r; y_ < y+r; y_++){
			for(var x_ = x-r; x_ < x+r; x_++){
				var idx = (Math.min(Math.max(x_, 0), width-1) +  Math.min(Math.max(y_, 0), height-1) * width) * 4;
				if(Math.sqrt((x_-x)*(x_-x)+(y_-y)*(y_-y)) < r){
					if(terrain_data[idx + 3] && Math.random() < 0.5){
						particles.push([idx, Math.random()*(x_-x), Math.random()*(y_-y)]);
					}
					else{
						terrain_data[idx + 3] = 0;
					}
				}
			}			
		}		
	}

	
	function update_particles(){
		for(var i=particles.length-1;i>=0;i--){
			var idx = particles[i][0];
			var dx = particles[i][1]+ windavity[0];
			var dy = particles[i][2]+ windavity[1];
			var pos = -1;
		
			var offset = (Math.round(dx) + Math.round(dy) * width) * 4;

			if(0 > idx + offset + 3 || terrain_data.length < idx + offset + 2){	
				terrain_data[idx + 3] = 0;
				particles.splice(i,1);
				continue;
			}
			if(!terrain_data[idx + offset + 3]){
				pos = idx + offset;
			}
			else{
				/* find any suitable spot */
				/* get magnitude */
				var mag = Math.sqrt(dx*dx + dy*dy);
				var step_x = dx/mag;
				var step_y = dy/mag;
				var prev = idx;
				for(var x = step_x, y = step_y, c=0; c<mag; x+=step_x, y+=step_y, c++){
					offset = (Math.round(x) + Math.round(y) * width) * 4;					
					if(terrain_data[idx + offset + 3]){
						//pos = prev;
						dx = x;
						dy = y;
						break;
					}
					else{
						prev = offset + idx;	
					}	
				}
				if(pos==-1){
					dx = dy = 0;					
					offset  = (1 * width) * 4;
					if(!terrain_data[idx + offset + 3]){
						pos = idx + offset;
					}
					else{
						offset  = (1 + 1 * width) * 4;
						if(!terrain_data[idx + offset + 3]){
							pos = idx + offset;
						}
						else{
							offset  = (-1 + 1 * width) * 4;
							if(!terrain_data[idx + offset + 3]){
								pos = idx + offset;
							}
						}
					}				
				}				
			}
			if(pos==-1){
				//particles.splice(i, 1);
				/*terrain_data[idx + 3]-=10;
				if(terrain_data[idx + 3]<0){
					terrain_data[idx + 3]=0;
					
				}
				if(dx === 0 && dy === 0){
				
				}
				else{
					//particles[i][1] = 0;
					//particles[i][2] = 1;
				}*/
			}
			else{
				terrain_data[pos] = terrain_data[idx];
				terrain_data[pos + 1] = terrain_data[idx + 1];
				terrain_data[pos + 2] = terrain_data[idx + 2];
				terrain_data[pos + 3] = terrain_data[idx + 3];
				terrain_data[idx + 3] = 0;
				particles[i][0] = pos;
				particles[i][1] = dx;
				particles[i][2] = dy;
			}
		}
	}


	function collapse(){
		var falling = false;
		for(var i=update_regions.length-1;i>=0;i--){
			
			var xmin = update_regions[i][0], xmax = update_regions[i][1], ymax = update_regions[i][2];
			
			for(var y = ymax; y > 0; y--){
				for(var x = xmin; x < xmax; x++){
					var idx = (x + y * width) * 4;
					var above = (x + (y-1) * width) * 4;
					if(!terrain_data[idx + 3] && terrain_data[above + 3]){
						falling = true;
						terrain_data[idx] = terrain_data[above];
						terrain_data[idx + 1] = terrain_data[above + 1];
						terrain_data[idx + 2] = terrain_data[above + 2];
						terrain_data[idx + 3] = terrain_data[above + 3];
						terrain_data[above+3] = 0;
					}
				}
			}
			if(!falling){
				update_regions.splice(i,1);
			}
		}
	}


	
	function random_trigger(){
		blow_hole(Math.floor(Math.random()*width),Math.floor(Math.random()*height),Math.floor(Math.random()*10+10));
	}
	setInterval(random_trigger, 1000);
	setTimeout(function(){ location.reload(true);}, 100000);
	/* events */ 
	player_canvas.onclick = function(event){
		var coords = terrain_canvas.relMouseCoords(event);
		blow_hole(coords.x, coords.y, Math.floor(Math.random()*30+10));
		terrain_change = true;
	};


	/*
	document.onkeydown = function(evt) {
		evt = evt || window.event;
		switch (evt.keyCode) {
        case 37:
            player.move_left(true);
            break;
		case 38:
            player.move_up(true);
            break;			
        case 39:
            player.move_right(true);
            break;
		}
	
	};
	document.onkeyup = function(evt) {
		evt = evt || window.event;
		switch (evt.keyCode) {
        case 37:
            player.move_left(false);
            break;
		case 38:
            player.move_up(false);
            break;
			
        case 39:
            player.move_right(false);
            break;
		}
	
	};*/
}