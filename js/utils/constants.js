const CANVAS_WIDTH = 960;
const CANVAS_HEIGHT = 540;
const TARGET_FPS = 60;
const FIXED_DT = 1 / TARGET_FPS;

const TILE_SIZE = 64;
const MAP_COLS = 80;
const MAP_ROWS = 60;
const MAP_PIXEL_WIDTH = MAP_COLS*TILE_SIZE;
const MAP_PIXEL_HEIGHT = MAP_ROWS*TILE_SIZE;

const TILE = {
    GRASS: 0,
    ROAD_H: 1,
    ROAD_V: 2,
    ROAD_CROSS: 3,
    ROAD_T_N: 4,
    ROAD_T_S: 5,
    ROAD_T_E: 6,
    ROAD_T_W: 7,
    ROAD_BEND_NE: 8,
    ROAD_BEND_NW: 9,
    ROAD_BEND_SE: 10,
    ROAD_BEND_SW: 11,
    SIDEWALK: 12,
    BUILDING: 13,
    FUEL_STATION: 14,
    PARK: 15,
    WATER: 16,
};

const DRIVEABLE_TILES = new Set([
    TILE.ROAD_H, TILE.ROAD_V, TILE.ROAD_CROSS, TILE.ROAD_T_N, TILE.ROAD_T_S,
    TILE.ROAD_T_E, TILE.ROAD_T_W,
    TILE.ROAD_BEND_NE, TILE.ROAD_BEND_NW,
    TILE.ROAD_BEND_SE, TILE.ROAD_BEND_SW,
    TILE.FUEL_STATION,
]);

const TILE_COLORS = {
    [TILE.GRASS]:        '#3a5c2a',
    [TILE.ROAD_H]:       '#3a3a3a',
    [TILE.ROAD_V]:       '#3a3a3a',
    [TILE.ROAD_CROSS]:   '#3a3a3a',
    [TILE.ROAD_T_N]:     '#3a3a3a',
    [TILE.ROAD_T_S]:     '#3a3a3a',
    [TILE.ROAD_T_E]:     '#3a3a3a',
    [TILE.ROAD_T_W]:     '#3a3a3a',
    [TILE.ROAD_BEND_NE]: '#3a3a3a',
    [TILE.ROAD_BEND_NW]: '#3a3a3a',
    [TILE.ROAD_BEND_SE]: '#3a3a3a',
    [TILE.ROAD_BEND_SW]: '#3a3a3a',
    [TILE.SIDEWALK]:     '#888878',
    [TILE.BUILDING]:     '#555566',
    [TILE.FUEL_STATION]: '#e8c020',
    [TILE.PARK]:         '#2a7a2a',
    [TILE.WATER]:        '#1a3a6a',
};

const PLAYER_WIDTH = 28;
const PLAYER_HEIGHT = 48;
const PLAYER_MAX_SPEED = 280;
const PLAYER_ACCELERATION = 220;
const PLAYER_BRAKE_FORCE = 380;
const PLAYER_FRICTION = 0.92;
const PLAYER_STEER_SPEED = 2.8;
const PLAYER_DRIFT_FACTOR = 0.96;
const PLAYER_START_X = (MAP_COLS/2)*TILE_SIZE;
const PLAYER_START_Y = (MAP_ROWS/2)*TILE_SIZE;

const TRAFFIC_CAR_WIDTH = 26;
const TRAFFIC_CAR_HEIGHT = 44;
const TRAFFIC_MAX_SPEED = 160;
const TRAFFIC_MIN_SPEED = 60;
const TRAFFIC_ACCELERATION = 120;
const TRAFFIC_FRICTION = 0.90;
const TRAFFIC_SAFE_DISTANCE = 90;
const TRAFFIC_STOP_DISTANCE = 40;
const TRAFFIC_CAR_COUNT = 25;

const GRAVITY = 0;
const COLLISION_BOUNCE = 0.35;
const COLLISION_DAMPING = 0.6;
const ROAD_FRICTION = 0.92;
const GRASS_FRICTION = 0.70;
const MIN_SPEED_THRESHOLD = 0.5;

const FUEL_MAX = 100;
const FUEL_CONSUMPTION = 0.012;
const FUEL_REFILL_COST = 30;
const FUEL_WARNING_LEVEL = 20;
const FUEL_CRITICAL_LEVEL = 10

const HEALTH_MAX = 100;
const DAMAGE_PER_COLLISION = 15;
const DAMAGE_SPEED_FACTOR = 0.08;
const HEALTH_WARNING_LEVEL = 30;
const HEALTH_CRITICAL_LEVEL = 15;

const SCORE_PER_METER = 0.5;
const SCORE_NEAR_MISS = 50;
const SCORE_SPEED_BONUS = 0.1;
const NEAR_MISS_DISTANCE = 30;

const MISSION_TYPES = {
    TAXI: 'taxi',
    DELIVERY: 'delivery',
    TIMETRIAL: 'timetrial'
};

const MISSION_STATUS = {
    IDLE: 'idle',
    ACTIVE: 'active',
    COMPLETE: 'complete',
    FAILED: 'failed'
};

const TAXI_BASE_REWARD = 100;
const TAXI_TIP_BONUS = 50;
const DELIVERY_BASE_REWARD = 150;
const DELIVERY_TIME_BONUS = 75;
const TIMETRIAL_BASE_REWARD = 200;
const TIMETRIAL_CHECKPOINT_BONUS = 25;

const PICKUP_RADIUS = 50;
const WAYPOINT_RADIUS = 40;

const UPGRADE_MAX_LEVEL = 5;

const UPGRADE_EFFECTS = {
    engine:{
        accelationBonus: 30,
        maxSpeedBonus: 20,
    },
    tires:{
        steerBonus: 0.3,
        frictionBonus: 0.01,
    },
    turbo: {
        maxSpeedBonus: 35,
        accelerationBonus: 15,
    },
    armor:{
        daamageReduction: 0.12,
    },
};

const CAMERA_LERP = 0.10;

const MINIMAP_WIDTH = 150;
const MINIMAP_HEIGHT = 150;
const MINIMAP_SCALE = MINIMAP_WIDTH / MINIMAP_HEIGHT;

const AUDIO_MASTER_VOLUME = 0.8;
const AUDIO_SFX_VOLUME = 0.9;
const AUDIO_MUSIC_VOLUME = 0.4;

const DOM = {
    CANVAS:           'gameCanvas',
    MINIMAP_CANVAS:   'minimapCanvas',
    GAME_CONTAINER:   'game-container',
    MAIN_MENU:        'main-menu',
    LOADING_SCREEN:   'loading-screen',
    LOADING_BAR:      'loading-bar',
    LOADING_STATUS:   'loading-status',
    UPGRADES_SCREEN:  'upgrades-screen',
    UPGRADES_LIST:    'upgrades-list',
    HOWTOPLAY_SCREEN: 'howtoplay-screen',
    HUD:              'hud',
    HUD_SPEED:        'speed-value',
    HUD_FUEL_BAR:     'fuel-bar',
    HUD_FUEL_TEXT:    'fuel-text',
    HUD_HEALTH_BAR:   'health-bar',
    HUD_HEALTH_TEXT:  'health-text',
    HUD_SCORE:        'score-value',
    HUD_MONEY:        'money-hud-value',
    MISSION_TITLE:    'mission-title',
    MISSION_OBJ:      'mission-objective',
    MISSION_TIMER:    'mission-timer',
    TIMER_VALUE:      'timer-value',
    PAUSE_MENU:       'pause-menu',
    MISSION_COMPLETE: 'mission-complete',
    MISSION_FAILED:   'mission-failed',
    GAME_OVER:        'game-over',
    REWARD_AMOUNT:    'reward-amount',
    BONUS_AMOUNT:     'bonus-amount',
    FAIL_REASON:      'fail-reason',
    FINAL_SCORE:      'final-score',
    TOAST:            'toast',
    FUEL_PROMPT:      'fuel-prompt',
    PASSENGER_PROMPT: 'passenger-prompt',
    MONEY_DISPLAY:    'money-amount',
};

const COLOR = {
    PLAYER_CAR:    '#e8401c',
    TRAFFIC_CAR:   '#4488ff',
    ROAD_MARKING:  '#ffffff',
    ROAD_LINE:     '#ffff00',
    BUILDING_ROOF: '#445566',
    BUILDING_WALL: '#334455',
    TREE:          '#228822',
    FUEL_ICON:     '#f5a623',
    PASSENGER:     '#ff88ff',
    WAYPOINT:      '#00ffcc',
    NEAR_MISS:     '#ffff00',
    MINIMAP_BG:    '#111111',
    MINIMAP_ROAD:  '#555555',
    MINIMAP_PLAYER:'#f5a623',
    MINIMAP_TRAFFIC:'#4488ff',
    MINIMAP_MISSION:'#00ffcc',
};

const DIR = {
    NORTH: 0,
    EAST: Math.PI/2,
    SOUTH: Math.PI,
    WEST: 3*Math.PI/2,
};