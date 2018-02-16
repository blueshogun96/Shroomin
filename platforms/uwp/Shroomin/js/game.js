/*
 * Shroomin
 *
 * (C) Shogun3D 2016
 */

/*
 * Globals
 */

var area_width = 1024;  /* 80% of 720p */
var area_height = 576;
var game_over = false;
var game_mode = 0;  /* 0=menu, 1=tutorial, 2=ingame */
var mouse_click = false;
var mouse_up = false;
var mouse_in_canvas = true;
var mouse_x = 0, mouse_y = 0;
var finger_x = 0, finger_y = 0;
var score = 0;
var stage = 1;
var stage_timer_id;
var document_loaded = false;
var game_canvas;
var context;
var game_speed = 1.0;
var gamepad;
var is_uwp = false;


/* User */
function user_t(x, y) {
    this.x = x;
    this.y = y;
    this.rot = 0;
    this.shield = false;
    this.invincible = false;
    this.invincibility_timer = 0;
    this.alpha = 192;
    this.flash_timer = 0;
}
user = new user_t(0, 0);

/* sphere */
function sphere_t(x, y, vx, vy, radius) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.radius = radius;
}

var spheres = [];
var sphere_speed_max = 5;

/* Mushroom */
function mushroom_t(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
}
mushroom = []; //new mushroom_t(area_width / 2, area_height / 2, 0);


/* Sprite images */
var mushrooms = []; //{ new Image(), new Image(), new Image() };
var mushrooms2 = new Image();
var smiley = new Image();
var grass = new Image();
var dialog = new Image();
var dialog2 = new Image();
var dialog3 = new Image();
var cursor_image = new Image();

mushrooms[0] = new Image();
mushrooms[1] = new Image();
mushrooms[2] = new Image();
mushrooms[0].src = "img/mushroom1.png";
mushrooms[1].src = "img/mushroom2.png";
mushrooms[2].src = "img/mushroom3.png";
smiley.src = "img/smiley.png";
grass.src = "img/tile_grass.png";
dialog.src = "img/UI.png";
dialog2.src = "img/UI2.png";
dialog3.src = "img/UI3.png";
cursor_image.src = "img/cursor.png";
mushrooms2.src = "img/mushrooms.png";

/*grass.onload = function()
 {
 context.fillStyle = context.createPattern( img, 'repeat' );
 context.fillRect( 0, 0, game_canvas.width, game_canvas.height );
 }*/


function set_uwp_mode(uwp) {
    is_uwp = uwp;
    if (uwp) navigator.gamepadInputEmulation = "gamepad";
}

/* Dialog UI */
function dialog_box_t()
{
    this.type = 0;
    this.active = false;
    this.x = 0;
    this.y = 0;
    this.centered = true;
    this.text = "nil";
    this.result = -1;
}
dialog_box = new dialog_box_t();

function draw_dialog_box()
{
    /* If the dialog box is active, draw it */
    if( dialog_box.active )
    {
        /* Calculate the dimensions of this dialog box */
        var width = 512, height = dialog_box.type == 2 ? 330 : 256;
        var dx = dialog_box.centered ? (area_width/2) - (width/2) : dialog_box.x;
        var dy = dialog_box.centered ? (area_height/2) - (height/2) : dialog_box.y;
        var sx = 0;
        var sy = dialog_box.type == 0 ? 0 : height;
        
        if( dialog_box.type != 2 )
            context.drawImage( dialog, sx, sy, width, height, dx, dy, width, height );
        else
            context.drawImage( dialog3, dx, dy );
        
        /* TODO: Multiple lines */
        var tx = dx + (width/2);
        var ty = dy + (height/2);
        
        if( dialog_box.type != 2 )
            draw_outlined_font( dialog_box.text, tx, ty, '24pt Helvetica', 'black', 'white', 6, 'center' );
        
        //('Score: ' + score, 30, 30, '14pt Helvetica', 'black', 'white', 6, 'left' );//
    }
}

function invoke_dialog_box( text, x, y, centered, type )
{
    /* Activate the dialog box */
    dialog_box.active = true;
    dialog_box.type = type;
    dialog_box.x = x;
    dialog_box.y = y;
    dialog_box.centered = centered;
    dialog_box.text = text;
}

function dialog_box_on_click( x, y )
{
    if( !dialog_box.active )
        return;
    
    //console.log( 'X: ' + x + ' Y: ' + y );
    
    /* If a button is clicked, respond */
    var x1, x2, y1, y2;
    var width = 512, height = 256;
    var dx = ((area_width/2)-(width/2));
    var dy = ((area_height/2)-(height/2));
    
    /* X button */
    x1 = dx+(512-5-60), y1 = dy+5, x2 = dx+512-5, y2 = dy+60+5;
    context.beginPath();
    context.lineWidth = '2';
    context.strokeStyle = 'red';
    context.rect( x1, y1, 60, 60 );
    context.stroke();
    if( x > x1 && x < x2 && y > y1 && y < y2 && mouse_up )
    {
        dialog_box.active = false;
        dialog_box.result = 0;
        //alertEx( "You clicked X" );
    }
    
    /* Yes and No buttons, respectively */
    if( dialog_box.type === 0 )
    {
        x1 = dx+((width/2)-80), y1 = dy+height-60-10, x2 = dx+((width/2)), y2 = dy+height+60-10;
        context.beginPath()
        context.lineWidth = '2';
        context.strokeStyle = 'red';
        context.rect( x1, y1, 80, 60 );
        context.stroke();
        if( x > x1 && x < x2 && y > y1 && y < y2 && mouse_up )
        {
            dialog_box.active = false;
            dialog_box.result = 2;
            //alertEx( "You clicked OK" );
        }
        
        x1 = dx+((width/2)), y1 = dy+height-60-10, x2 = dx+((width/2)+80), y2 = dy+height+60-10;
        context.beginPath()
        context.lineWidth = '2';
        context.strokeStyle = 'red';
        context.rect( x1, y1, 80, 60 );
        context.stroke();
        if( x > x1 && x < x2 && y > y1 && y < y2 && mouse_up )
        {
            dialog_box.active = false;
            dialog_box.result = 3;
            //alertEx( "You clicked OK" );
        }
    }
    /* OK button */
    if( dialog_box.type === 1 )
    {
        x1 = dx+((width/2)-40), y1 = dy+height-60-10, x2 = dx+((width/2)+40), y2 = dy+height+60-10;
        context.beginPath()
        context.lineWidth = '2';
        context.strokeStyle = 'red';
        context.rect( x1, y1, 80, 60 );
        context.stroke();
        if( x > x1 && x < x2 && y > y1 && y < y2 && mouse_up )
        {
            dialog_box.active = false;
            dialog_box.result = 1;
            //alertEx( "You clicked OK" );
        }
    }
    /* Main menu */
    if( dialog_box.type === 2 )
    {
        
    }
}

/* Sound effects */
var sndfx = [];

function init_soundfx() {
    sndfx[0] = new buzz.sound("snd/birds2", { formats: ["mp3", "wav"] });
    sndfx[1] = new buzz.sound("snd/birds9", { formats: ["mp3", "wav"] });
    sndfx[2] = new buzz.sound("snd/Emberiza.pusilla", { formats: ["mp3", "wav"] });
    sndfx[3] = new buzz.sound("snd/pop", { formats: ["mp3", "wav"] });
    sndfx[4] = new buzz.sound("snd/coupoing", { formats: ["mp3", "wav"] });
}




/*
 * Utility functions
 */

function alertEx(str) {
    if (is_mobile.windows() || navigator.platform == "Win64") {
        var msg = new Windows.UI.Popups.MessageDialog(str);
        msg.showAsync();
        return;
    }
    
    alert(str);
}

function on_document_loaded() {
    document_loaded = true;
}

function block_until_document_loaded() {
    while (document_loaded)
        ;
}

function remove(arr, item) {
    /*for( var i = arr.length; i--; )
     {
     if( arr[i] === item )
     {
     arr.splice(i, 1);
     }
     }*/
    
    var i = arr.indexOf(item);
    if (i != -1)
        arr.splice(i, 1);
}

function draw_font(string, x, y, font, colour, alignment ) {
    /* Draw the text */
    context.font = font;
    context.fillStyle = colour;
    context.textAlign = alignment;
    context.fillText(string, Math.floor(x), Math.floor(y));
}

function draw_outlined_font( string, x, y, font, stroke_colour, fill_colour, outline_width, alignment )
{
    /* Font type and alignment */
    context.font = font;
    context.textAlign = alignment;
    
    /* TODO: Experiment with this */
    context.miterLimit = 2;
    context.lineJoin = 'round'; //'circle';
    
    /* Draw font outlined, then filled */
    context.lineWidth = outline_width;
    context.strokeStyle = stroke_colour;
    context.strokeText( string, x, y );
    context.lineWidth = 1;
    context.fillStyle = fill_colour;
    context.fillText( string, x, y );
}

function check_for_intersection(p1, p2, p3, p4) {
    var intersection_data = { x: 0, y: 0, positive: false };
    var x = [], y = [];
    x[0] = p1.x; x[1] = p2.x; x[2] = p3.x; x[3] = p4.x;
    y[0] = p1.y; y[1] = p2.y; y[2] = p3.y; y[3] = p4.y;
    
    var d = (x[0] - x[1]) * (y[2] - y[3]) - (y[0] - y[1]) * (x[2] - x[3]);
    
    if (d == 0) return intersection_data;
    
    // Get the x and y
    var pre = (x[0] * y[1] - y[0] * x[1]), post = (x[2] * y[3] - y[2] * x[3]);
    var X = (pre * (x[2] - x[3]) - (x[0] - x[1]) * post) / d;
    var Y = (pre * (y[2] - y[3]) - (y[0] - y[1]) * post) / d;
    
    // Check if the x and y coordinates are within both lines
    if (X < Math.min(x[0], x[1]) || X > Math.max(x[0], x[1]) ||
        X < Math.min(x[2], x[3]) || X > Math.max(x[2], x[3])) return intersection_data;
    if (Y < Math.min(y[0], y[1]) || Y > Math.max(y[0], y[1]) ||
        Y < Math.min(y[2], y[3]) || Y > Math.max(y[2], y[3])) return intersection_data;
    
    intersection_data.x = X;
    intersection_data.y = Y;
    intersection_data.positive = true;
    
    return intersection_data;
}

function point_inside_triangle(s, a, b, c) {
    /* Determine whether the given point (s) is within the triangle formed by points A, B and C */
    
    var as_x = s.x - a.x;
    var as_y = s.y - a.y;
    
    var s_ab = ((b.x - a.x) * as_y - (b.y - a.y) * as_x > 0) ? true : false;
    
    if ((c.x - a.x) * as_y - (c.y - a.y) * as_x > 0 == s_ab) return false;
    
    if ((c.x - b.x) * (s.y - b.y) - (c.y - b.y) * (s.x - b.x) > 0 != s_ab) return false;
    
    return true;
}

var last_loop = new Date;
var filter_strength = 10;
var frame_time = 0;

function calculate_fps() {
    /*var this_loop = new Date;
     var fps = 1000 / (this_loop - last_loop);
     last_loop = this_loop;
     
     draw_font( 'Frames Per Second: ' + (fps).toFixed(1), 50, 50, '10pt Helvetica', 'black' ); */
    
    var this_frame_time = (this_loop = new Date) - last_loop;
    frame_time += (this_frame_time - frame_time) / filter_strength;
    last_loop = this_loop;
    
    draw_font('Frames Per Second: ' + (1000 / frame_time).toFixed(0), area_width - 200,area_height - 30, '10pt Helvetica', 'black', 'left');
}

function update_mouse_position() {
    /* Save the current and previous mouse position */
    user.lx = user.x;
    user.ly = user.y;
    user.x = mouse_x;
    user.y = mouse_y;
    
    /* Keep the user in bounds */
    if( user.x < 0 ) user.x = 0;
    if( user.x > area_width ) user.x = area_width;
    if( user.y < 0 ) user.y = 0;
    if( user.y > area_height ) user.y = area_height;
}

function snd_play(id) {
    sndfx[id].stop();
    sndfx[id].currentTime = 0;
    sndfx[id].play();
}

function snd_loop(id) {
    sndfx[id].currentTime = 0;
    sndfx[id].play();
    sndfx[id].loop();
}

function snd_stop(id) {
    sndfx[id].stop();
}

function snd_volume(id, volume) {
    sndfx[id].setVolume(volume);
}


/*
 * Game functions
 */

function on_mouse_move(mouseEvent) {
    mouseEvent = mouseEvent || window.event;
    
    var obj = document.getElementById("game_canvas");
    var obj_left = 0;
    var obj_top = 0;
    
    while (obj.offsetParent) {
        obj_left += obj.offsetLeft;
        obj_top += obj.offsetTop;
        obj = obj.offsetParent;
    }
    if (mouseEvent) {
        //FireFox
        mouse_x = mouseEvent.pageX;
        mouse_y = mouseEvent.pageY;
    }
    else {
        //IE
        mouse_x = window.event.x + document.body.scrollLeft - 2;
        mouse_y = window.event.y + document.body.scrollTop - 2;
    }
    
    mouse_x -= obj_left;
    mouse_y -= obj_top;
}

function on_mouse_out() {
    mouse_in_canvas = false;
    //canvas.setCapture();
    //alert( "Hahahahaha, please stop!" );
}

function on_mouse_over() {
    mouse_in_canvas = true;
    //canvas.releaseCapture();
}

function on_mouse_click() {
    /* Save mouse click */
    mouse_click = true;
}

function on_mouse_up() {
    mouse_up = true;
}

function draw_cursor() {
    context.drawImage(cursor_image, Math.floor(user.x), Math.floor(user.y));
}

function global_alpha(alpha, operation) {
    /* Set alpha level and blending operation */
    context.globalAlpha = alpha;
    context.globalCompositeOperation = operation;
}

function draw_overlay() {
    /* Draw the overlay image */
    global_alpha(0.05, "none");
    context.drawImage(overlay_image, 0, 0, area_width, Math.floor(768 * (area_height / 768)));
    global_alpha(1.0, "none");
}

function reset_game() {
    /* Reset all lists */
    spheres = [];
    mushroom = [];
    
    mushroom.push( new mushroom_t( Math.floor(Math.random() * area_width),
                                  Math.floor(Math.random() * area_height),
                                  Math.floor(Math.random() * 3) ) );
    
    /* Reset the user stats */
    score = 0;
    
    /* Reset other stuff */
    sphere_speed_max = 5;
    spheres_until_next_max_spawn = 10;
    
    game_over = false;
}

function distance(x1, y1, x2, y2) {
    /* Determine the distance between the two points */
    
    var x = x2 - x1;
    var y = y2 - y1;
    
    x *= x;
    y *= y;
    
    return Math.sqrt(x + y);
}

function draw_user() {
    context.drawImage(smiley, user.x - (smiley.width / 4), user.y - (smiley.height / 4),smiley.width / 2, smiley.height / 2);
}


var max_mushrooms = 1;
var spheres_until_next_max_spawn = 10;
var spawn_speed = 3*60; // Frame based spawning
var spawn_timer = 0;

mushroom.push(new mushroom_t(area_width / 2, area_height / 2, 0));

function handle_mushroom() {
    for( var i = mushroom.length; i--; )
    {
        var type = mushroom[i].type;
        var img = mushrooms[mushroom[i].type];
        var x = mushroom[i].x;
        var y = mushroom[i].y;
        var size = 32; //mushrooms[mushroom[i].type].width;
    
        /* Draw the mushroom in it's current place */
        context.drawImage(img, x - (size / 2), y - (size / 2), size, size);
    
        /* Did we get the mushroom? */
        var d = distance(user.x, user.y, x, y);
        if (d < 16) {
            score++;
            mushroom[i].x = Math.floor(Math.random() * area_width);
            mushroom[i].y = Math.floor(Math.random() * area_height);
            mushroom[i].type = Math.floor(Math.random() * 3);
        
            if (mushroom[i].x > area_width - 50)
                mushroom[i].x = area_width - 50;
            if (mushroom[i].y > area_height - 50)
                mushroom[i].y = area_height - 50;
            if (mushroom[i].x < 50)
                mushroom[i].x = 50;
            if (mushroom[i].y < 50)
                mushroom[i].y = 50;
        
            snd_play(3);
            add_sphere();
              
              spheres_until_next_max_spawn--;
              
              if( spheres_until_next_max_spawn < 1 )
              {
                  var m = new mushroom_t( Math.floor(Math.random() * area_width),
                                      Math.floor(Math.random() * area_height),
                                        Math.floor(Math.random() * 3) );
                  mushroom.push(m);

                  spheres_until_next_max_spawn = 10;
              }
        }
    }
              
              
    /*spawn_timer++;
              
    if( spawn_timer >= spawn_speed )
              {
              spawn_timer = 0;
              
              }*/
}

function handle_game_over() {
    
}


function add_sphere() {
    var start_side = Math.floor(Math.random() * 4);
    var rx = Math.random() * area_width;
    var ry = Math.random() * area_height;
    var vx = (sphere_speed_max) + 1;
    var vy = (sphere_speed_max) + 1;
    var id = ((Math.random() * 100) > 80) ? Math.floor(Math.random() * 4) : 4;
    
    if (rx < 50) rx = 50;
    if (rx > area_width - 50) rx = area_width - 50;
    if (ry < 50) ry = 50;
    if (ry > area_height - 50) ry = area_height - 50;
    
    var x, y;
    
    if (start_side === 0) /* Left side */ {
        x = 0; y = ry;
    }
    if (start_side === 1) /* Right side */ {
        x = area_width, y = ry;
    }
    if (start_side === 2) /* Top side */ {
        x = rx, y = 0;
    }
    if (start_side === 3) /* Bottom side */ {
        x = rx, y = area_height;
    }
    
    /* Do not allow the newly spawned sphere to be within 50 pixels of the user */
    var d = distance(x, y, user.x, user.y);
    if (d < 50) {
        add_sphere();
    }
    else {
        if (start_side === 0) /* Left side */ {
            var s = new sphere_t(0, ry, vx, 0, 4);
            spheres.push(s);
        }
        if (start_side === 1) /* Right side */ {
            var s = new sphere_t(area_width, ry, -vx, 0, 4);
            spheres.push(s);
        }
        if (start_side === 2) /* Top side */ {
            var s = new sphere_t(rx, 0, 0, vy, 4);
            spheres.push(s);
        }
        if (start_side === 3) /* Bottom side */ {
            var s = new sphere_t(rx, area_height, 0, -vy, 4);
            spheres.push(s);
        }
    }
}

function draw_spheres() {
    /* Draw spheres */
    for (var i = spheres.length; i--;) {
        context.beginPath();
        context.arc(spheres[i].x, spheres[i].y, spheres[i].radius, 0, 2.0 * Math.PI);
        context.fillStyle = 'black';
        context.fill();
    }
}

function update_spheres() {
    /* Update spheres */
    for (var i = spheres.length; i--;) {
        /* Move spheres along the screen */
        spheres[i].x += spheres[i].vx * game_speed;
        spheres[i].y += spheres[i].vy * game_speed;
        
        if (!game_over) {
            /* Check for collisions with the user */
            var d = distance(spheres[i].x, spheres[i].y, user.x, user.y);
            if (d < 12) {
                game_over = true;
                //alertEx("Oh no, you died!");
                snd_play(4);
                //invoke_dialog_box( "Your Score: " + score + "\nTry Again?", 0, 0, true, 1 );
            }
        }
        
        /* Check for spheres off the screen. If they are, delete them now. */
        if (spheres[i].x > area_width + 1 || spheres[i].x < -1 || spheres[i].y > area_height + 1|| spheres[i].y < -1) {
            spheres[i].vx *= -1;
            spheres[i].vy *= -1;
            continue;
        }
    }
    
    /* Spawn new sphere roughly every second */
    /*sphere_spawn_timer += game_speed;
     if( sphere_spawn_timer > sphere_spawn_timer_max )
     {
     if( !game_over )
     add_sphere();
     
     sphere_spawn_timer = 0;
     }*/
}


function match(p1, p2) {
    if (p1.x == p2.x && p1.y == p2.y)
        return true;
    
    return false;
}
function identical_points(t1, t2) {
    var t1p1 = { x: t1.x1, y: t1.y1 };
    var t1p2 = { x: t1.x2, y: t1.y2 };
    var t2p1 = { x: t2.x1, y: t2.y1 };
    var t2p2 = { x: t2.x2, y: t2.y2 };
    
    if (match(t1p1, t2p1)) return true;
    if (match(t1p1, t2p2)) return true;
    if (match(t1p2, t2p2)) return true;
    if (match(t1p2, t2p1)) return true;
    
    return false;
}


function draw_hud() {
    draw_outlined_font('Score: ' + score, 30, 30, '14pt Helvetica', 'black', 'white', 6, 'left' );
}

function clear_canvas() {
    /* Resetting the canvas dimensions clears it entirely */
    //game_canvas.width = area_width;
    //game_canvas.height = area_height;
    
    /* Draw a white rectangle to clear the screen with */
    var context = game_canvas.getContext("2d");
    context.fillStyle = 'white';
    context.fillRect(0, 0, area_width, area_height);
    //context.beginPath();
    //context.rect( 0, 0, area_width, area_height );
    //context.fillStyle = 'white';
    //context.fill();
}

function draw_border() {
    global_alpha(1.0, 'none');
    
    /* Draw a white rectangle to clear the screen with */
    context.beginPath();
    context.rect(0, 0, area_width, area_height);
    
    /* Simulate a thick border */
    context.lineWidth = 10;
    context.strokeStyle = 'black';
    context.stroke();
}

function draw_title_screen() {
    
    /* Draw some mushrooms on the sides */
    //context.drawImage( mushrooms2, (area_width/2)-(mushrooms2.width)-40, (area_height/2)-(mushrooms2.height/2) );
    //context.drawImage( mushrooms2, (area_width/2)+40, (area_height/2)-(mushrooms2.height/2) );
    context.drawImage( mushrooms2, (area_width/2)-(mushrooms2.width/2), (area_height/2)-(mushrooms2.height/2) );
    
    /* Title text */
    draw_outlined_font( "Shroomin", area_width/2, area_height/2, '48pt Helvetica', 'black', 'white', 10, 'center' );
}

function start_game() {
    game_mode = 2;
    game_over = false;
    //alertEx( "Okay, we started" );
    
    //stage_timer_id = setTimeout(stage_timer_func, 15000);
}

function stop_game() {
    /*game_over = true;
     clearTimeout( stage_timer_id );
     
     snd_play(2);*/
}

function update_title_screen() {
    /* Was the start button clicked? */
    if (mouse_click) {
        //if (user.x > (area_width / 16) && user.x < (area_width / 16) + (((area_width / 3) - 50) / 2) &&
        //    user.y > (area_height / 3) + 220 && user.y < (area_height / 3) + 260) {
            start_game();
        //}
    }
}

var is_mobile =
{
android: function () {
    return navigator.userAgent.match(/Android/i);
},
black_berry: function () {
    return navigator.userAgent.match(/BlackBerry/i);
},
ios: function () {
    return navigator.userAgent.match(/iPhone|iPad|iPod/i);
},
opera_mini: function () {
    return navigator.userAgent.match(/Opera Mini/i);
},
windows: function () {
    return navigator.userAgent.match(/IEMobile/i);
},
any: function () {
    return (is_mobile.android() || is_mobile.black_berry() || is_mobile.ios() ||is_mobile.opera_mini() || is_mobile.windows());
}
};

function draw_grass_tile() {
    context.fillStyle = context.createPattern(grass, 'repeat');
    context.fillRect(0, 0, game_canvas.width, game_canvas.height);
}

function delay(ms) {
    var cur_d = new Date();
    var cur_ticks = cur_d.getTime();
    var ms_passed = 0;
    while(ms_passed < ms) {
        var d = new Date();  // Possible memory leak?
        var ticks = d.getTime();
        ms_passed = ticks - cur_ticks;
        // d = null;  // Prevent memory leak?
    }
}

/* The main loop function */
function main_loop() {
    /* Update mouse position */
    update_mouse_position();
    
    /* Clear the screen */
    clear_canvas();
    
    draw_grass_tile();
    draw_border();
    
    /* Game started */
    if( game_mode == 2 )
    {
        if( !dialog_box.active )
        {
            movement_gamepad();
        
            handle_mushroom();
            draw_spheres();
            update_spheres();
            draw_user();
            draw_hud();
        }
    }
    
    draw_dialog_box();
    if( !is_mobile.any() )
        dialog_box_on_click( mouse_x, mouse_y );
    else
        dialog_box_on_click( finger_x, finger_y );
    
    /* Title screen */
    if( game_mode == 0 )
    {
        draw_title_screen();
        update_title_screen();
    }
    
    if( dialog_box.active || game_mode == 0 )
    {
        /* Draw the cursor while the dialog box is active, only for non-mobile/embedded */
        if( !is_mobile.any() )
            draw_cursor();
    }
    
    calculate_fps();
    
    if (game_over)
    {
        delay(500);
        invoke_dialog_box( "Your Score: " + score + "\nTry Again?", 0, 0, true, 0 );
        reset_game();
    }
    
    /* Reset mouse click flag */
    mouse_click = false;
    mouse_up = false;
}

function go_fullscreen() {
    var canvas = document.getElementById("game_canvas");
    if (canvas.requestFullScreen)
        canvas.requestFullScreen();
    else if (canvas.webkitRequestFullScreen)
        canvas.webkitRequestFullScreen();
    else if (canvas.mozRequestFullScreen)
        canvas.mozRequestFullScreen();
}

var offset_x = 0, offset_y = 0;

/* Set mouse callback functions */
function setup_event_handlers() {
    var canvas = document.getElementById("game_canvas");
    
    if (!is_mobile.any() && !is_uwp ) {
        canvas.addEventListener("mousemove", on_mouse_move);
        canvas.addEventListener("mouseout", on_mouse_out);
        canvas.addEventListener("mouseover", on_mouse_over);
        canvas.addEventListener("mouseup", function(e) {
                                //dialog_box_on_click( e.x, e.y );
                                mouse_up = true;
                                });
    }
    else {
        if (is_mobile.windows() || is_uwp ) {
            canvas.addEventListener('pointerdown', function (e) { mouse_click = true; } );
            canvas.addEventListener('pointermove', on_mouse_move);
            canvas.addEventListener('pointerup', function (e) { mouse_up = true } ); // TODO: dialog_box
        }
        
        canvas.addEventListener('touchstart', function (e) {
                                finger_x = mouse_x = e.changedTouches[0].pageX;
                                finger_y = mouse_y = e.changedTouches[0].pageY;
                                offset_x = mouse_x - user.x;
                                offset_y = mouse_y - user.y;
                                mouse_x = e.changedTouches[0].pageX - offset_x;
                                mouse_y = e.changedTouches[0].pageY - offset_y;
                                e.preventDefault();
                                mouse_click = true;
                                }, false);
        canvas.addEventListener('touchmove', function (e) {
                                mouse_x = e.changedTouches[0].pageX - offset_x;
                                mouse_y = e.changedTouches[0].pageY - offset_y;
                                finger_x = e.changedTouches[0].pageX;
                                finger_y = e.changedTouches[0].pageY;
                                e.preventDefault();
                                }, false);
        canvas.addEventListener('touchend', function (e) {
                                mouse_x = e.changedTouches[0].pageX - offset_x;
                                mouse_y = e.changedTouches[0].pageY - offset_y;
                                finger_x = e.changedTouches[0].pageX;
                                finger_y = e.changedTouches[0].pageY;
                                //dialog_box_on_click( e.changedTouches[0].pageX, e.changedTouches[0].pageY );
                                mouse_up = true;
                                e.preventDefault();
                                }, false);
        
    }
    
    /* Key events for Amazon Fire TV */
    /* canvas.addEventListener('keypress', function (e) {
     alert("You pressed: " + e.keyCode);
     
     if (e.keyCode === 38) user.y -= 7;
     if (e.keyCode === 40) user.y += 7;
     if (e.keyCode === 37) user.x -= 7;
     if (e.keyCode === 39) user.x += 7;
     e.preventDefault();
     }, false);*/
    
    /* Gamepads */
    //setInterval( scangamepads, 500 );
}

function scangamepads() {
    /* Try taking the first available gamepad */
    var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads : []);
    for (var i = 0; i < gamepads.length; i++) {
        if (gamepads[i]) {
            alert("We got one");
            gamepad = gamepads[i];
            return;
        }
    }
}

function movement_gamepad() {
    /* Try taking the first available gamepad */
    var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads : []);
    for (var i = 0; i < gamepads.length; i++) {
        if (gamepads[i]) {
            gamepad = gamepads[i];
            
            if (gamepad.buttons[0].pressed) mouse_y -= 7;
            if (gamepad.buttons[1].pressed) mouse_y += 7;
            if (gamepad.buttons[2].pressed) mouse_x -= 7;
            if (gamepad.buttons[3].pressed) mouse_x += 7;
            
            if (gamepad.buttons[12].pressed) mouse_y -= 7;
            if (gamepad.buttons[13].pressed) mouse_y += 7;
            if (gamepad.buttons[14].pressed) mouse_x -= 7;
            if (gamepad.buttons[15].pressed) mouse_x += 7;
            
            /*for( var j = 0; j < gamepad.buttons.length; j++ )
             {
             if( gamepad.buttons[j].pressed )
             alert( "Button: " + j );
             }*/
            
            return;
        }
    }
}

/*
 * Game entry point
 */

var mobile_version = false;

function on_load_mobile() {
    /* Set mobile flag */
    mobile_version = true;
    
    /* Resume on_load() */
    on_load();
    
    /* Resize canvas */
    game_canvas.width = window.innerWidth;
    game_canvas.height = window.innerHeight;
    area_width = window.innerWidth;
    area_height = window.innerHeight;
}

function on_load() {
    var anim_frame;
    
    /* Redirect mobile users to the mobile version of this page */
    /* The mobile webpage should have the appropriate icon stating that this
     game will be available on the app store for their device. */
    if (is_mobile.any() && mobile_version == false) {
        //return;
    }
    
    /* Get canvas and context */
    game_canvas = document.getElementById("game_canvas");
    context = game_canvas.getContext("2d");
    
    var dimension = [document.documentElement.clientWidth,document.documentElement.clientHeight];
    game_canvas.width = dimension[0];
    game_canvas.height = dimension[1];
    
    area_width = dimension[0];
    area_height = dimension[1];
    
    mouse_x = area_width / 2;
    mouse_y = area_height / 2;;
    
    mushroom.x = Math.floor(Math.random() * area_width);
    mushroom.y = Math.floor(Math.random() * area_height);
    mushroom.type = Math.floor(Math.random() * 3);
    
    if (mushroom.x > area_width - 50)
        mushroom.x = area_width - 50;
    if (mushroom.y > area_height - 50)
        mushroom.y = area_height - 50;
    if (mushroom.x < 50)
        mushroom.x = 50;
    if (mushroom.y < 50)
        mushroom.y = 50;
    
    /* Initialize sound effects */
    init_soundfx();
    
    snd_loop(0);
    snd_loop(1);
    snd_loop(2);
    snd_volume(0, 30);
    snd_volume(1, 30);
    snd_volume(2, 30);
    
    /* Animate main loop */
    var main = function () {
        main_loop();
        anim_frame(main);
    }
    
    /* Verify support for buzz sound library */
    if (!buzz.isSupported())
        console.log("HTML5 audio does not appear to be supported on your browser!");
    if (!buzz.isWAVSupported())
        console.log("This browser doesn't appear to support .wav format!");
    if (!buzz.isMP3Supported())
        console.log("This browser doesn't appear to support .mp3 format either!");
    
    //go_fullscreen();
    //block_until_document_loaded();
    setup_event_handlers();
    
    //invoke_dialog_box( " ", 0, 0, true, 2 );
    
    if (window.mozRequestAnimationFrame) {
        anim_frame = window.mozRequestAnimationFrame;
        anim_frame(main);
    }
    else if (window.requestAnimationFrame) {
        anim_frame = window.requestAnimationFrame;
        anim_frame(main);
    }
    else {
        var vblank_time = 1000 / 60;
        setInterval(main_loop, vblank_time);
    }
    
}