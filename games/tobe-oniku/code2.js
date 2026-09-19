gdjs.MahjangCode = {};
gdjs.MahjangCode.localVariables = [];
gdjs.MahjangCode.idToCallbackMap = new Map();
gdjs.MahjangCode.GDNewSpriteObjects1= [];
gdjs.MahjangCode.GDNewSpriteObjects2= [];
gdjs.MahjangCode.GDNewSprite2Objects1= [];
gdjs.MahjangCode.GDNewSprite2Objects2= [];
gdjs.MahjangCode.GDNewSprite3Objects1= [];
gdjs.MahjangCode.GDNewSprite3Objects2= [];
gdjs.MahjangCode.GDNewSprite4Objects1= [];
gdjs.MahjangCode.GDNewSprite4Objects2= [];
gdjs.MahjangCode.GDNewSprite5Objects1= [];
gdjs.MahjangCode.GDNewSprite5Objects2= [];
gdjs.MahjangCode.GDNewBBTextObjects1= [];
gdjs.MahjangCode.GDNewBBTextObjects2= [];
gdjs.MahjangCode.GDNewSprite6Objects1= [];
gdjs.MahjangCode.GDNewSprite6Objects2= [];
gdjs.MahjangCode.GDNewSprite7Objects1= [];
gdjs.MahjangCode.GDNewSprite7Objects2= [];
gdjs.MahjangCode.GDNewSprite8Objects1= [];
gdjs.MahjangCode.GDNewSprite8Objects2= [];
gdjs.MahjangCode.GDNewSprite9Objects1= [];
gdjs.MahjangCode.GDNewSprite9Objects2= [];
gdjs.MahjangCode.GDNewTextObjects1= [];
gdjs.MahjangCode.GDNewTextObjects2= [];
gdjs.MahjangCode.GDNewText2Objects1= [];
gdjs.MahjangCode.GDNewText2Objects2= [];
gdjs.MahjangCode.GDNewSprite10Objects1= [];
gdjs.MahjangCode.GDNewSprite10Objects2= [];
gdjs.MahjangCode.GDNewSprite11Objects1= [];
gdjs.MahjangCode.GDNewSprite11Objects2= [];
gdjs.MahjangCode.GDNewSprite12Objects1= [];
gdjs.MahjangCode.GDNewSprite12Objects2= [];
gdjs.MahjangCode.GDNewSprite13Objects1= [];
gdjs.MahjangCode.GDNewSprite13Objects2= [];
gdjs.MahjangCode.GDNewSprite14Objects1= [];
gdjs.MahjangCode.GDNewSprite14Objects2= [];
gdjs.MahjangCode.GDNewSprite15Objects1= [];
gdjs.MahjangCode.GDNewSprite15Objects2= [];
gdjs.MahjangCode.GDNewSprite16Objects1= [];
gdjs.MahjangCode.GDNewSprite16Objects2= [];
gdjs.MahjangCode.GDNewSprite17Objects1= [];
gdjs.MahjangCode.GDNewSprite17Objects2= [];


gdjs.MahjangCode.mapOfGDgdjs_9546MahjangCode_9546GDNewSprite16Objects1Objects = Hashtable.newFrom({"NewSprite16": gdjs.MahjangCode.GDNewSprite16Objects1});
gdjs.MahjangCode.eventsList0 = function(runtimeScene) {

{


let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.runtimeScene.sceneJustBegins(runtimeScene);
if (isConditionTrue_0) {
isConditionTrue_0 = false;
{isConditionTrue_0 = runtimeScene.getOnceTriggers().triggerOnce(12825628);
}
}
if (isConditionTrue_0) {
gdjs.copyArray(runtimeScene.getObjects("NewBBText"), gdjs.MahjangCode.GDNewBBTextObjects1);
gdjs.copyArray(runtimeScene.getObjects("NewSprite11"), gdjs.MahjangCode.GDNewSprite11Objects1);
gdjs.copyArray(runtimeScene.getObjects("NewSprite2"), gdjs.MahjangCode.GDNewSprite2Objects1);
{for(var i = 0, len = gdjs.MahjangCode.GDNewBBTextObjects1.length ;i < len;++i) {
    gdjs.MahjangCode.GDNewBBTextObjects1[i].hide();
}
}
{gdjs.evtTools.sound.playMusicOnChannel(runtimeScene, "とあるパンダの愛娘.mp3", 1, false, 50, 1);
}
{for(var i = 0, len = gdjs.MahjangCode.GDNewSprite11Objects1.length ;i < len;++i) {
    gdjs.MahjangCode.GDNewSprite11Objects1[i].hide();
}
}
{for(var i = 0, len = gdjs.MahjangCode.GDNewSprite2Objects1.length ;i < len;++i) {
    gdjs.MahjangCode.GDNewSprite2Objects1[i].getBehavior("Animation").setAnimationIndex(1);
}
}
}

}


{

gdjs.copyArray(runtimeScene.getObjects("NewSprite16"), gdjs.MahjangCode.GDNewSprite16Objects1);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.cursorOnObject(gdjs.MahjangCode.mapOfGDgdjs_9546MahjangCode_9546GDNewSprite16Objects1Objects, runtimeScene, true, false);
if (isConditionTrue_0) {
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.isMouseButtonReleased(runtimeScene, "Left");
}
if (isConditionTrue_0) {
gdjs.copyArray(runtimeScene.getObjects("NewBBText"), gdjs.MahjangCode.GDNewBBTextObjects1);
gdjs.copyArray(runtimeScene.getObjects("NewSprite11"), gdjs.MahjangCode.GDNewSprite11Objects1);
/* Reuse gdjs.MahjangCode.GDNewSprite16Objects1 */
gdjs.copyArray(runtimeScene.getObjects("NewSprite2"), gdjs.MahjangCode.GDNewSprite2Objects1);
gdjs.copyArray(runtimeScene.getObjects("NewSprite4"), gdjs.MahjangCode.GDNewSprite4Objects1);
{gdjs.evtTools.sound.playSound(runtimeScene, "001_雨晴はう（ノーマル）_ロン.wav", false, 100, 1);
}
{for(var i = 0, len = gdjs.MahjangCode.GDNewBBTextObjects1.length ;i < len;++i) {
    gdjs.MahjangCode.GDNewBBTextObjects1[i].hide(false);
}
}
{for(var i = 0, len = gdjs.MahjangCode.GDNewSprite11Objects1.length ;i < len;++i) {
    gdjs.MahjangCode.GDNewSprite11Objects1[i].hide(false);
}
}
{for(var i = 0, len = gdjs.MahjangCode.GDNewSprite16Objects1.length ;i < len;++i) {
    gdjs.MahjangCode.GDNewSprite16Objects1[i].hide();
}
}
{gdjs.evtTools.sound.playSound(runtimeScene, "決定ボタンを押す35.mp3", false, 100, 1);
}
{for(var i = 0, len = gdjs.MahjangCode.GDNewSprite4Objects1.length ;i < len;++i) {
    gdjs.MahjangCode.GDNewSprite4Objects1[i].hide();
}
}
{for(var i = 0, len = gdjs.MahjangCode.GDNewSprite2Objects1.length ;i < len;++i) {
    gdjs.MahjangCode.GDNewSprite2Objects1[i].getBehavior("Animation").setAnimationIndex(0);
}
}
}

}


};

gdjs.MahjangCode.func = function(runtimeScene) {
runtimeScene.getOnceTriggers().startNewFrame();

gdjs.MahjangCode.GDNewSpriteObjects1.length = 0;
gdjs.MahjangCode.GDNewSpriteObjects2.length = 0;
gdjs.MahjangCode.GDNewSprite2Objects1.length = 0;
gdjs.MahjangCode.GDNewSprite2Objects2.length = 0;
gdjs.MahjangCode.GDNewSprite3Objects1.length = 0;
gdjs.MahjangCode.GDNewSprite3Objects2.length = 0;
gdjs.MahjangCode.GDNewSprite4Objects1.length = 0;
gdjs.MahjangCode.GDNewSprite4Objects2.length = 0;
gdjs.MahjangCode.GDNewSprite5Objects1.length = 0;
gdjs.MahjangCode.GDNewSprite5Objects2.length = 0;
gdjs.MahjangCode.GDNewBBTextObjects1.length = 0;
gdjs.MahjangCode.GDNewBBTextObjects2.length = 0;
gdjs.MahjangCode.GDNewSprite6Objects1.length = 0;
gdjs.MahjangCode.GDNewSprite6Objects2.length = 0;
gdjs.MahjangCode.GDNewSprite7Objects1.length = 0;
gdjs.MahjangCode.GDNewSprite7Objects2.length = 0;
gdjs.MahjangCode.GDNewSprite8Objects1.length = 0;
gdjs.MahjangCode.GDNewSprite8Objects2.length = 0;
gdjs.MahjangCode.GDNewSprite9Objects1.length = 0;
gdjs.MahjangCode.GDNewSprite9Objects2.length = 0;
gdjs.MahjangCode.GDNewTextObjects1.length = 0;
gdjs.MahjangCode.GDNewTextObjects2.length = 0;
gdjs.MahjangCode.GDNewText2Objects1.length = 0;
gdjs.MahjangCode.GDNewText2Objects2.length = 0;
gdjs.MahjangCode.GDNewSprite10Objects1.length = 0;
gdjs.MahjangCode.GDNewSprite10Objects2.length = 0;
gdjs.MahjangCode.GDNewSprite11Objects1.length = 0;
gdjs.MahjangCode.GDNewSprite11Objects2.length = 0;
gdjs.MahjangCode.GDNewSprite12Objects1.length = 0;
gdjs.MahjangCode.GDNewSprite12Objects2.length = 0;
gdjs.MahjangCode.GDNewSprite13Objects1.length = 0;
gdjs.MahjangCode.GDNewSprite13Objects2.length = 0;
gdjs.MahjangCode.GDNewSprite14Objects1.length = 0;
gdjs.MahjangCode.GDNewSprite14Objects2.length = 0;
gdjs.MahjangCode.GDNewSprite15Objects1.length = 0;
gdjs.MahjangCode.GDNewSprite15Objects2.length = 0;
gdjs.MahjangCode.GDNewSprite16Objects1.length = 0;
gdjs.MahjangCode.GDNewSprite16Objects2.length = 0;
gdjs.MahjangCode.GDNewSprite17Objects1.length = 0;
gdjs.MahjangCode.GDNewSprite17Objects2.length = 0;

gdjs.MahjangCode.eventsList0(runtimeScene);
gdjs.MahjangCode.GDNewSpriteObjects1.length = 0;
gdjs.MahjangCode.GDNewSpriteObjects2.length = 0;
gdjs.MahjangCode.GDNewSprite2Objects1.length = 0;
gdjs.MahjangCode.GDNewSprite2Objects2.length = 0;
gdjs.MahjangCode.GDNewSprite3Objects1.length = 0;
gdjs.MahjangCode.GDNewSprite3Objects2.length = 0;
gdjs.MahjangCode.GDNewSprite4Objects1.length = 0;
gdjs.MahjangCode.GDNewSprite4Objects2.length = 0;
gdjs.MahjangCode.GDNewSprite5Objects1.length = 0;
gdjs.MahjangCode.GDNewSprite5Objects2.length = 0;
gdjs.MahjangCode.GDNewBBTextObjects1.length = 0;
gdjs.MahjangCode.GDNewBBTextObjects2.length = 0;
gdjs.MahjangCode.GDNewSprite6Objects1.length = 0;
gdjs.MahjangCode.GDNewSprite6Objects2.length = 0;
gdjs.MahjangCode.GDNewSprite7Objects1.length = 0;
gdjs.MahjangCode.GDNewSprite7Objects2.length = 0;
gdjs.MahjangCode.GDNewSprite8Objects1.length = 0;
gdjs.MahjangCode.GDNewSprite8Objects2.length = 0;
gdjs.MahjangCode.GDNewSprite9Objects1.length = 0;
gdjs.MahjangCode.GDNewSprite9Objects2.length = 0;
gdjs.MahjangCode.GDNewTextObjects1.length = 0;
gdjs.MahjangCode.GDNewTextObjects2.length = 0;
gdjs.MahjangCode.GDNewText2Objects1.length = 0;
gdjs.MahjangCode.GDNewText2Objects2.length = 0;
gdjs.MahjangCode.GDNewSprite10Objects1.length = 0;
gdjs.MahjangCode.GDNewSprite10Objects2.length = 0;
gdjs.MahjangCode.GDNewSprite11Objects1.length = 0;
gdjs.MahjangCode.GDNewSprite11Objects2.length = 0;
gdjs.MahjangCode.GDNewSprite12Objects1.length = 0;
gdjs.MahjangCode.GDNewSprite12Objects2.length = 0;
gdjs.MahjangCode.GDNewSprite13Objects1.length = 0;
gdjs.MahjangCode.GDNewSprite13Objects2.length = 0;
gdjs.MahjangCode.GDNewSprite14Objects1.length = 0;
gdjs.MahjangCode.GDNewSprite14Objects2.length = 0;
gdjs.MahjangCode.GDNewSprite15Objects1.length = 0;
gdjs.MahjangCode.GDNewSprite15Objects2.length = 0;
gdjs.MahjangCode.GDNewSprite16Objects1.length = 0;
gdjs.MahjangCode.GDNewSprite16Objects2.length = 0;
gdjs.MahjangCode.GDNewSprite17Objects1.length = 0;
gdjs.MahjangCode.GDNewSprite17Objects2.length = 0;


return;

}

gdjs['MahjangCode'] = gdjs.MahjangCode;
