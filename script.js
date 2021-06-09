const playground = document.querySelector(".playground");
const scoreboard = document.querySelector(".score");

const GAME_ROWS = 20;
const GAME_COLS = 10;

const BLOCKS = { //
	block_t : [
		[[2,1],[0,1],[1,0],[1,1]],
		[[0,0],[0,1],[1,1],[0,2]],
		[[0,0],[1,0],[2,0],[1,1]],
		[[1,0],[1,1],[1,2],[0,1]]
	],
	block_o : [
		[[0,0],[0,1],[1,0],[1,1]],
		[[0,0],[0,1],[1,0],[1,1]],
		[[0,0],[0,1],[1,0],[1,1]],
		[[0,0],[0,1],[1,0],[1,1]]
	],
	block_i : [
		[[0,0],[1,0],[2,0],[3,0]],
		[[0,0],[0,1],[0,2],[0,3]],
		[[0,0],[1,0],[2,0],[3,0]],
		[[0,0],[0,1],[0,2],[0,3]]
	],
	block_l : [
		[[0,0],[1,0],[2,0],[0,1]],
		[[0,0],[1,0],[1,1],[1,2]],
		[[0,1],[1,1],[2,1],[2,0]],
		[[0,0],[0,1],[0,2],[1,2]]
	],
	block_j : [
		[[0,0],[2,1],[1,0],[2,0]],
		[[1,0],[1,1],[0,2],[1,2]],
		[[0,1],[1,1],[2,1],[0,0]],
		[[0,0],[0,1],[0,2],[1,0]]
	],
	block_s : [
		[[0,1],[1,1],[1,0],[2,0]],
		[[0,0],[0,1],[1,1],[1,2]],
		[[0,1],[1,1],[1,0],[2,0]],
		[[0,0],[0,1],[1,1],[1,2]]
	],
	block_z : [
		[[0,0],[1,0],[1,1],[2,1]],
		[[1,0],[1,1],[0,1],[0,2]],
		[[0,0],[1,0],[1,1],[2,1]],
		[[1,0],[1,1],[0,1],[0,2]]
	]
};

const movingItem = {
	type : 'block_z',
	direction : 0,
	x : 3,
	y : 0
};

let fallingItem = null;
let score = 0;
let interval;

init();
function init() {
	//creating new table;
	for (let i = 0; i < GAME_ROWS; i++) {
		createNewRow();
	}
	createMovingBlock();

	interval = setInterval(function(){
		fallBlock();
	}, 1000);
}

function createNewRow() {
	let tr = document.createElement("tr");
	for (let j = 0; j < GAME_COLS; j++) {
		let matrix = document.createElement("td");
		tr.prepend(matrix);
	}
	playground.prepend(tr);
}

function createMovingBlock(){
	fallingItem = {...movingItem};
	fallingItem.type = (["block_t","block_o","block_i","block_l","block_j","block_s","block_z"])[Math.floor(Math.random()*7)];

	//todo : 블럭이 쌓이면 생성될 때 위에 계속 쌓이는 문제가 생김;
	//1칸이 남았을 때 블럭이 움직일 수 있는지 확인 해야함;
	//못 움직이면 게임 종료;
	if(!checkBlockMobility(0,0,fallingItem.direction)){
		if(!checkBlockMobility(0,-1,fallingItem.direction)){
			//게임종료
			clearInterval(interval);
			alert("게임종료");
			console.log("게임이종료");
			return false;
		}else{
			console.log("y -= 1")
			fallingItem.y--;
		}
	}

	BLOCKS[fallingItem.type][fallingItem.direction].forEach(block => {
		const x = block[0] + fallingItem.x;
		const y = block[1] + fallingItem.y;
		if(y >= 0){
			const target = playground.childNodes[y].childNodes[x];
			target.classList.add(fallingItem.type, "moving");
		}
	});
}

function moveFallingBlock(dx, dy, direction){
	if(fallingItem === null || !checkBlockMobility(dx, dy, direction)) return false;
	
	BLOCKS[fallingItem.type][fallingItem.direction].forEach(block => {
		const x = block[0] + fallingItem.x;
		const y = block[1] + fallingItem.y;
		if(y >= 0){
			const target = playground.childNodes[y].childNodes[x];
			target.classList.remove(fallingItem.type, "moving");
		}
	});
	
	fallingItem.x += dx;
	fallingItem.y += dy;
	fallingItem.direction = direction;

	BLOCKS[fallingItem.type][fallingItem.direction].forEach(block => {
		const x = block[0] + fallingItem.x;
		const y = block[1] + fallingItem.y;
		if(y >= 0){
			const target = playground.childNodes[y].childNodes[x];
			target.classList.add(fallingItem.type, "moving");
		}
	});

	return true;
}

function fallBlock(){
	const isFall = fallingItem === null ? false : moveFallingBlock(0, 1, fallingItem.direction);
	if(!isFall){
		//바닥에 착지;
		if(fallingItem === null){
			createMovingBlock();
		}else{
			//블럭을 바닥에 고정
			BLOCKS[fallingItem.type][fallingItem.direction].forEach(block => {
				const x = block[0] + fallingItem.x;
				const y = block[1] + fallingItem.y;
				const target = playground.childNodes[y].childNodes[x];
				target.classList.remove("moving");
				target.classList.add("fixed");
			});
			fallingItem = null;

			breakLine();
		}
	}
}

function breakLine(){
	for(let i = 0; i < GAME_ROWS; i++){
		const row = playground.childNodes[i];
		let flag = false;

		for(let j = 0; j < GAME_COLS && !flag; j++){
			if(row.childNodes[j].classList[0] == null) flag = true;
		}
		if(!flag){
			playground.removeChild(row);
			createNewRow();
			score += GAME_COLS;
			scoreboard.innerHTML = score;
		}
	}
}

function checkBlockMobility(dx, dy, direction){
	let flag = true;
	let cnt = 0;
	BLOCKS[fallingItem.type][direction].forEach(block => {
		if(flag){
			const x = block[0] + fallingItem.x + dx;
			const y = block[1] + fallingItem.y + dy;
			if(x >= 0 && x < GAME_COLS && y < GAME_ROWS){
				if(y >= 0){
					const list = playground.childNodes[y].childNodes[x].classList;
					if(list[1] == "fixed") flag = false;
					else cnt++;
				}
			}else {
				flag = false;
			}
		}
	});
	return flag && cnt > 0;
}

document.addEventListener("keydown", e => {
	switch (e.keyCode) {
		case 39: moveFallingBlock(1, 0, fallingItem.direction); break;
		case 37: moveFallingBlock(-1, 0, fallingItem.direction); break;
		case 40: fallBlock(); break;
		case 32: moveFallingBlock(0, 0, (fallingItem.direction+1)%4);
		default: break;
	}
});