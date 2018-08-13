var PLAYER_MAX_HP = 200;
//
var DEFAULT_SHOT_DAMAGE = 0.2;
var FIRE_SHOT_DAMAGE = 1;
var ICE_SHOT_DAMAGE = 1;
var SPREAD_SHOT_DAMAGE = 2;
var ELECTRIC_SHOT_DAMAGE = 1;
//
var FOOT_STEP_INTERVAL = 20; // In frames at 60fps
//
// Interval between shots, in seconds
var DEFAULT_SHOT_PLAYER_DELAY = 0.1;
var FIRE_SHOT_PLAYER_DELAY = 0.25;
var ICE_SHOT_PLAYER_DELAY = 0.5;
var SPREAD_SHOT_PLAYER_DELAY = 0.25;
var ELECTRIC_SHOT_PLAYER_DELAY = 3;
//
// Shot speed, in pixels per frame
var DEFAULT_SHOT_PLAYER_SPEED = 25;
var FIRE_SHOT_PLAYER_SPEED = 20;
var ICE_SHOT_PLAYER_SPEED = 10;
var SPREAD_SHOT_PLAYER_SPEED = 5;
//
var DEFAULT_SHOT_ENEMY_SPEED = 5;
var FIRE_SHOT_ENEMY_SPEED = 10;
var ICE_SHOT_ENEMY_SPEED = 2;
var SPREAD_SHOT_ENEMY_SPEED = 2;
//
var ELECTRIC_SHOT_SPEED = 40; // In pixels per frame
var ELECTRIC_SHOT_AMOUNT = 20;
var ELECTRIC_SHOT_START_DELAY = 1; // In seconds
//
var ENEMY_SPREAD_SHOTS_AMOUNT = 5;
var ENEMY_SPREAD_DEGREE_RANGE = 30;
//
var ICE_SLOW_MULTIPLIER = 0.75;
var SHIELD_SPEED_MULTIPLIER = 2.5;
var PLAYER_SPEED_MULTIPLIER = 1.5;
//
var FIRE_PRICE = 10;
var ICE_PRICE = 20;
var SPREAD_PRICE = 30;
var ELECTRIC_PRICE = 40;
var HP_PRICE = 100;
//
//
//
//
var SOUND_MAIN_MUSIC_VOLUME = 0.6;
var SOUND_HURT_1_VOLUME = .01;
var SOUND_HURT_2_VOLUME = .01;
var SOUND_HURT_3_VOLUME = .01;
var SOUND_HURT_4_VOLUME = .01;
var SOUND_HURT_5_VOLUME = .01;
var SOUND_FOOTSTEP_1_VOLUME = .05;
var SOUND_FOOTSTEP_2_VOLUME = .05;
var SOUND_FOOTSTEP_3_VOLUME = .05;
var SOUND_FOOTSTEP_4_VOLUME = .05;
var SOUND_FOOTSTEP_5_VOLUME = .05;
var SOUND_BASIC_FIRE_VOLUME = .1;
var SOUND_FIRE_FIRE_VOLUME = .3;
var SOUND_ICE_FIRE_VOLUME = .3;
var SOUND_ELECTRIC_FIRE_VOLUME = .5;
var SOUND_ENEMY_HIT_BASIC_VOLUME = .07;
var SOUND_ENEMY_HIT_FIRE_VOLUME = .1;
var SOUND_ENEMY_HIT_ICE_VOLUME = .05;
var SOUND_ENEMY_HIT_ELECTRIC_VOLUME = .02;
var SOUND_ENEMY_DEATH_VOLUME = .5;
var SOUND_SHIELD_ENEMY_HIT_VOLUME = .2;
var SOUND_WEAPON_SWITCH_VOLUME = .4;
var SOUND_PLAYER_DEATH_VOLUME = .5;
var SOUND_MOUSE_HOVER_VOLUME = .4;
var SOUND_MOUSE_SELECT_VOLUME = .1;
var SOUND_MOUSE_SELECT_VOLUME = .1;
