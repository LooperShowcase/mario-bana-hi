kaboom({
  global: true,
  fullscreen: true,
  clearColor: [0, 0.5, 1, 1],
  debug: true,
  scale: 2,
});
loadRoot("./sprites/");
loadSprite("mario", "mario.png");
loadSprite("coin", "coin.png");
loadSprite("block", "ground.png");
loadSprite("surprise", "surprise.png");
loadSprite("unboxed", "unboxed.png");
loadSprite("goomba", "evil_mushroom.png");
loadSprite("mushroom", "mushroom.png");
loadSprite("logo","loop.png");
loadSprite("castle","castle.png");
loadSound("gameSound", "gameSound.mp3");
loadSound("jumpSound", "jumpSound.mp3");
scene("begin",()=>{
  add([
  text("press enter to start the game",20),
  origin("center"),
  pos(width()/2,height()/2),
  ]);
  add([
    sprite("logo"),
    origin("center"),
    pos(width()/2,height()/2+20),
  ]);
  keyRelease("enter",()=>{
    go("game");
  });
})
scene("win",(score)=>{
  add([
    text("Mario is the winner\n score:"+score+"",30),
  ]);
})
scene("vacation", (score) => {
  add([
    text("Bana \n game over\n score:"+score+"\n press enter to play again", 30),
    origin("center"),
    pos(width() / 2, height() / 2),
  ]);
  keyRelease("enter", ()=>{
    go("begin")
  });

});
scene("game", () => {
  play("gameSound");
  layers(["bg", "obj", "ui"], "obj");
  const symbolMap = {
    width: 20,
    height: 20,
    "=": [sprite("block"), solid(),scale(1.3)],
    "?": [sprite("surprise"), solid(), "surprise-coin"],
    "!": [sprite("surprise"), solid(), "surprise-mushroom"],
    $: [sprite("coin"), "coin"],
    m: [sprite("mushroom"), body(), "mushroom"],
    x: [sprite("unboxed"),solid()],
    "^": [sprite("goomba"), body(), solid(), "goomba"],
    c:[sprite("castle"),layer("bg"),"castle"],
  };
  const map = [
    "                                                                            ",
    "                                        ===                                 ",
    "                                                                ??!?        ",
    "                                                                            ",
    "               $$$$                                   $$$$$$                ",
    "                          ???????                                           ",
    "       ???                                                                  ",
    "                                                        !!??         c      ",
    "                  !!!!                        !!!!                          ",
    "                                                                            ",
    "        ^            ^             ^                                        ",
    "============================================================================",
    "============================================================================",
  ];
  const jumpForce = 450;
  let score=0;
  const scoreLabel=add([
    text("Score:"+score),
    pos(50,10),
    layer("ui"),
    {value:score,
    }
  ]);
  

  const player = add([
    sprite("mario"),
    solid(),
    pos(40, 0),
    body(),
    origin("center"),
    big(jumpForce),
  ]);
  const speed = 120;
  keyDown("right", () => {
    player.move(speed, 0);
  });
  keyDown("left", () => {
    if (player.pos.x > 10) player.move(-speed, 0);
  });
  let isJumping = false;
  keyDown("space", () => {
    if (player.grounded()) {
      player.jump(jumpForce);
      play("jumpSound");
      isJumping = true;
    }
  });
  player.on("headbump", (obj) => {
    if (obj.is("surprise-coin")) {
      gameLevel.spawn("$", obj.gridPos.sub(0, 1));
      destroy(obj);
      gameLevel.spawn("x", obj.gridPos);
    }
    if (obj.is("surprise-mushroom")) {
      gameLevel.spawn("m", obj.gridPos.sub(0, 1));
      destroy(obj);
      gameLevel.spawn("x", obj.gridPos);
    }
  });
  player.collides("coin", (x) => {
    destroy(x);
    scoreLabel.value+=1;
    scoreLabel.text="score"+scoreLabel.value;
  });
  player.collides("mushroom", (mush) => {
    destroy(mush);
    player.biggify(5);
  });
  action("mushroom", (mush) => {
    mush.move(50, 0);
  });
  action("goomba", (gege) => {
    gege.move(-20, 0);
  });
  player.collides("goomba", (x) => {
    if (isJumping) {
      destroy(x);
      scoreLabel.value+=2;
      scoreLabel.text="score"+scoreLabel.value;
    } else {
      if (player.isBig()) {
        player.smallify();
        destroy(x);
      } else {
        destroy(player);
        go("vacation", scoreLabel.value);
      }
    }
  });
  player.action(() => {
    camPos(player.pos.x, 200);
    scoreLabel.pos.x=player.pos.x - 200;
    // console.log(player.pos.x)
    if(player.pos.x>=1420.75167){
      go("win", scoreLabel.value);
    }
    if (player.grounded()) {
      isJumping = false;
    } else {
      isJumping = true;
    }
    if (player.pos.y >= height()) {
      go("vacation",scoreLabel.value);
    }
  });

  const gameLevel = addLevel(map, symbolMap);
});
start("begin");
