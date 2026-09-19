gdjs.MenuCode = {};
gdjs.MenuCode.localVariables = [];
gdjs.MenuCode.idToCallbackMap = new Map();
gdjs.MenuCode.GDTitleObjects1= [];
gdjs.MenuCode.GDTitleObjects2= [];
gdjs.MenuCode.GDTitleObjects3= [];
gdjs.MenuCode.GDTitleObjects4= [];
gdjs.MenuCode.GDPlaneObjects1= [];
gdjs.MenuCode.GDPlaneObjects2= [];
gdjs.MenuCode.GDPlaneObjects3= [];
gdjs.MenuCode.GDPlaneObjects4= [];
gdjs.MenuCode.GDBlackRectangleObjects1= [];
gdjs.MenuCode.GDBlackRectangleObjects2= [];
gdjs.MenuCode.GDBlackRectangleObjects3= [];
gdjs.MenuCode.GDBlackRectangleObjects4= [];
gdjs.MenuCode.GDGroundObjects1= [];
gdjs.MenuCode.GDGroundObjects2= [];
gdjs.MenuCode.GDGroundObjects3= [];
gdjs.MenuCode.GDGroundObjects4= [];
gdjs.MenuCode.GDBackgroundObjects1= [];
gdjs.MenuCode.GDBackgroundObjects2= [];
gdjs.MenuCode.GDBackgroundObjects3= [];
gdjs.MenuCode.GDBackgroundObjects4= [];
gdjs.MenuCode.GDAuthorLinkObjects1= [];
gdjs.MenuCode.GDAuthorLinkObjects2= [];
gdjs.MenuCode.GDAuthorLinkObjects3= [];
gdjs.MenuCode.GDAuthorLinkObjects4= [];
gdjs.MenuCode.GDStartObjects1= [];
gdjs.MenuCode.GDStartObjects2= [];
gdjs.MenuCode.GDStartObjects3= [];
gdjs.MenuCode.GDStartObjects4= [];
gdjs.MenuCode.GDTitletestObjects1= [];
gdjs.MenuCode.GDTitletestObjects2= [];
gdjs.MenuCode.GDTitletestObjects3= [];
gdjs.MenuCode.GDTitletestObjects4= [];
gdjs.MenuCode.GDcopryObjects1= [];
gdjs.MenuCode.GDcopryObjects2= [];
gdjs.MenuCode.GDcopryObjects3= [];
gdjs.MenuCode.GDcopryObjects4= [];
gdjs.MenuCode.GDHigescoreObjects1= [];
gdjs.MenuCode.GDHigescoreObjects2= [];
gdjs.MenuCode.GDHigescoreObjects3= [];
gdjs.MenuCode.GDHigescoreObjects4= [];
gdjs.MenuCode.GDSkinObjects1= [];
gdjs.MenuCode.GDSkinObjects2= [];
gdjs.MenuCode.GDSkinObjects3= [];
gdjs.MenuCode.GDSkinObjects4= [];


gdjs.MenuCode.asyncCallback12604228 = function (runtimeScene, asyncObjectsList) {
asyncObjectsList.restoreLocalVariablesContainers(gdjs.MenuCode.localVariables);
{gdjs.evtTools.runtimeScene.replaceScene(runtimeScene, "Game", false);
}
gdjs.MenuCode.localVariables.length = 0;
}
gdjs.MenuCode.idToCallbackMap.set(12604228, gdjs.MenuCode.asyncCallback12604228);
gdjs.MenuCode.eventsList0 = function(runtimeScene) {

{


{
{
const asyncObjectsList = new gdjs.LongLivedObjectsList();
asyncObjectsList.backupLocalVariablesContainers(gdjs.MenuCode.localVariables);
runtimeScene.getAsyncTasksManager().addTask(gdjs.evtTools.runtimeScene.wait(1), (runtimeScene) => (gdjs.MenuCode.asyncCallback12604228(runtimeScene, asyncObjectsList)), 12604228, asyncObjectsList);
}
}

}


};gdjs.MenuCode.eventsList1 = function(runtimeScene) {

{


let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.runtimeScene.sceneJustBegins(runtimeScene);
if (isConditionTrue_0) {
gdjs.copyArray(runtimeScene.getObjects("BlackRectangle"), gdjs.MenuCode.GDBlackRectangleObjects2);
{gdjs.evtTools.camera.showLayer(runtimeScene, "Transition");
}
{for(var i = 0, len = gdjs.MenuCode.GDBlackRectangleObjects2.length ;i < len;++i) {
    gdjs.MenuCode.GDBlackRectangleObjects2[i].getBehavior("Opacity").setOpacity(0);
}
}
}

}


{

gdjs.copyArray(runtimeScene.getObjects("Start"), gdjs.MenuCode.GDStartObjects2);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
for (var i = 0, k = 0, l = gdjs.MenuCode.GDStartObjects2.length;i<l;++i) {
    if ( gdjs.MenuCode.GDStartObjects2[i].IsClicked(null) ) {
        isConditionTrue_0 = true;
        gdjs.MenuCode.GDStartObjects2[k] = gdjs.MenuCode.GDStartObjects2[i];
        ++k;
    }
}
gdjs.MenuCode.GDStartObjects2.length = k;
if (isConditionTrue_0) {
gdjs.copyArray(runtimeScene.getObjects("BlackRectangle"), gdjs.MenuCode.GDBlackRectangleObjects2);
{gdjs.evtTools.sound.playSoundOnChannel(runtimeScene, "決定ボタンを押す35.mp3", 2, false, 80, 0.9);
}
{for(var i = 0, len = gdjs.MenuCode.GDBlackRectangleObjects2.length ;i < len;++i) {
    gdjs.MenuCode.GDBlackRectangleObjects2[i].getBehavior("Tween").addObjectOpacityTween2("FadeOut", 255, "easeInQuad", 1, false);
}
}
{gdjs.evtTools.sound.stopMusicOnChannel(runtimeScene, 1);
}

{ //Subevents
gdjs.MenuCode.eventsList0(runtimeScene);} //End of subevents
}

}


{

gdjs.copyArray(runtimeScene.getObjects("BlackRectangle"), gdjs.MenuCode.GDBlackRectangleObjects2);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
for (var i = 0, k = 0, l = gdjs.MenuCode.GDBlackRectangleObjects2.length;i<l;++i) {
    if ( gdjs.MenuCode.GDBlackRectangleObjects2[i].getBehavior("Tween").hasFinished("FadeOut") ) {
        isConditionTrue_0 = true;
        gdjs.MenuCode.GDBlackRectangleObjects2[k] = gdjs.MenuCode.GDBlackRectangleObjects2[i];
        ++k;
    }
}
gdjs.MenuCode.GDBlackRectangleObjects2.length = k;
if (isConditionTrue_0) {
}

}


{

gdjs.copyArray(runtimeScene.getObjects("Higescore"), gdjs.MenuCode.GDHigescoreObjects2);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
for (var i = 0, k = 0, l = gdjs.MenuCode.GDHigescoreObjects2.length;i<l;++i) {
    if ( gdjs.MenuCode.GDHigescoreObjects2[i].IsClicked(null) ) {
        isConditionTrue_0 = true;
        gdjs.MenuCode.GDHigescoreObjects2[k] = gdjs.MenuCode.GDHigescoreObjects2[i];
        ++k;
    }
}
gdjs.MenuCode.GDHigescoreObjects2.length = k;
if (isConditionTrue_0) {
gdjs.copyArray(runtimeScene.getObjects("BlackRectangle"), gdjs.MenuCode.GDBlackRectangleObjects2);
{gdjs.evtTools.sound.playSoundOnChannel(runtimeScene, "決定ボタンを押す35.mp3", 1, false, 80, 0.9);
}
{gdjs.evtTools.sound.stopMusicOnChannel(runtimeScene, 1);
}
{for(var i = 0, len = gdjs.MenuCode.GDBlackRectangleObjects2.length ;i < len;++i) {
    gdjs.MenuCode.GDBlackRectangleObjects2[i].getBehavior("Tween").addObjectOpacityTween2("FadeOut", 255, "easeInQuad", 1, false);
}
}
{gdjs.evtTools.leaderboards.displayLeaderboard(runtimeScene, "a399e39c-3075-4d51-a27d-d514f16a9faa", false);
}
}

}


{


let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.leaderboards.hasPlayerJustClosedLeaderboardView();
if (isConditionTrue_0) {
{gdjs.evtTools.runtimeScene.replaceScene(runtimeScene, "Menu", false);
}
}

}


};gdjs.MenuCode.asyncCallback12610020 = function (runtimeScene, asyncObjectsList) {
asyncObjectsList.restoreLocalVariablesContainers(gdjs.MenuCode.localVariables);
gdjs.copyArray(runtimeScene.getObjects("Plane"), gdjs.MenuCode.GDPlaneObjects2);
{for(var i = 0, len = gdjs.MenuCode.GDPlaneObjects2.length ;i < len;++i) {
    gdjs.MenuCode.GDPlaneObjects2[i].getBehavior("Animation").setAnimationIndex(1);
}
}
{runtimeScene.getGame().getVariables().getFromIndex(0).setNumber(1);
}
gdjs.MenuCode.localVariables.length = 0;
}
gdjs.MenuCode.idToCallbackMap.set(12610020, gdjs.MenuCode.asyncCallback12610020);
gdjs.MenuCode.eventsList2 = function(runtimeScene) {

{


{
{
const asyncObjectsList = new gdjs.LongLivedObjectsList();
asyncObjectsList.backupLocalVariablesContainers(gdjs.MenuCode.localVariables);
runtimeScene.getAsyncTasksManager().addTask(gdjs.evtTools.runtimeScene.wait(1), (runtimeScene) => (gdjs.MenuCode.asyncCallback12610020(runtimeScene, asyncObjectsList)), 12610020, asyncObjectsList);
}
}

}


};gdjs.MenuCode.asyncCallback12610868 = function (runtimeScene, asyncObjectsList) {
asyncObjectsList.restoreLocalVariablesContainers(gdjs.MenuCode.localVariables);
gdjs.copyArray(runtimeScene.getObjects("Plane"), gdjs.MenuCode.GDPlaneObjects2);
{for(var i = 0, len = gdjs.MenuCode.GDPlaneObjects2.length ;i < len;++i) {
    gdjs.MenuCode.GDPlaneObjects2[i].getBehavior("Animation").setAnimationIndex(2);
}
}
{runtimeScene.getGame().getVariables().getFromIndex(0).setNumber(2);
}
gdjs.MenuCode.localVariables.length = 0;
}
gdjs.MenuCode.idToCallbackMap.set(12610868, gdjs.MenuCode.asyncCallback12610868);
gdjs.MenuCode.eventsList3 = function(runtimeScene) {

{


{
{
const asyncObjectsList = new gdjs.LongLivedObjectsList();
asyncObjectsList.backupLocalVariablesContainers(gdjs.MenuCode.localVariables);
runtimeScene.getAsyncTasksManager().addTask(gdjs.evtTools.runtimeScene.wait(1), (runtimeScene) => (gdjs.MenuCode.asyncCallback12610868(runtimeScene, asyncObjectsList)), 12610868, asyncObjectsList);
}
}

}


};gdjs.MenuCode.asyncCallback12613212 = function (runtimeScene, asyncObjectsList) {
asyncObjectsList.restoreLocalVariablesContainers(gdjs.MenuCode.localVariables);
gdjs.copyArray(runtimeScene.getObjects("Plane"), gdjs.MenuCode.GDPlaneObjects2);
{for(var i = 0, len = gdjs.MenuCode.GDPlaneObjects2.length ;i < len;++i) {
    gdjs.MenuCode.GDPlaneObjects2[i].getBehavior("Animation").setAnimationIndex(3);
}
}
{runtimeScene.getGame().getVariables().getFromIndex(0).setNumber(3);
}
gdjs.MenuCode.localVariables.length = 0;
}
gdjs.MenuCode.idToCallbackMap.set(12613212, gdjs.MenuCode.asyncCallback12613212);
gdjs.MenuCode.eventsList4 = function(runtimeScene) {

{


{
{
const asyncObjectsList = new gdjs.LongLivedObjectsList();
asyncObjectsList.backupLocalVariablesContainers(gdjs.MenuCode.localVariables);
runtimeScene.getAsyncTasksManager().addTask(gdjs.evtTools.runtimeScene.wait(1), (runtimeScene) => (gdjs.MenuCode.asyncCallback12613212(runtimeScene, asyncObjectsList)), 12613212, asyncObjectsList);
}
}

}


};gdjs.MenuCode.asyncCallback12614524 = function (runtimeScene, asyncObjectsList) {
asyncObjectsList.restoreLocalVariablesContainers(gdjs.MenuCode.localVariables);
gdjs.copyArray(runtimeScene.getObjects("Plane"), gdjs.MenuCode.GDPlaneObjects2);
{for(var i = 0, len = gdjs.MenuCode.GDPlaneObjects2.length ;i < len;++i) {
    gdjs.MenuCode.GDPlaneObjects2[i].getBehavior("Animation").setAnimationIndex(4);
}
}
{runtimeScene.getGame().getVariables().getFromIndex(0).setNumber(4);
}
gdjs.MenuCode.localVariables.length = 0;
}
gdjs.MenuCode.idToCallbackMap.set(12614524, gdjs.MenuCode.asyncCallback12614524);
gdjs.MenuCode.eventsList5 = function(runtimeScene) {

{


{
{
const asyncObjectsList = new gdjs.LongLivedObjectsList();
asyncObjectsList.backupLocalVariablesContainers(gdjs.MenuCode.localVariables);
runtimeScene.getAsyncTasksManager().addTask(gdjs.evtTools.runtimeScene.wait(1), (runtimeScene) => (gdjs.MenuCode.asyncCallback12614524(runtimeScene, asyncObjectsList)), 12614524, asyncObjectsList);
}
}

}


};gdjs.MenuCode.asyncCallback12616284 = function (runtimeScene, asyncObjectsList) {
asyncObjectsList.restoreLocalVariablesContainers(gdjs.MenuCode.localVariables);
gdjs.copyArray(runtimeScene.getObjects("Plane"), gdjs.MenuCode.GDPlaneObjects2);
{for(var i = 0, len = gdjs.MenuCode.GDPlaneObjects2.length ;i < len;++i) {
    gdjs.MenuCode.GDPlaneObjects2[i].getBehavior("Animation").setAnimationIndex(0);
}
}
{runtimeScene.getGame().getVariables().getFromIndex(0).setNumber(0);
}
gdjs.MenuCode.localVariables.length = 0;
}
gdjs.MenuCode.idToCallbackMap.set(12616284, gdjs.MenuCode.asyncCallback12616284);
gdjs.MenuCode.eventsList6 = function(runtimeScene) {

{


{
{
const asyncObjectsList = new gdjs.LongLivedObjectsList();
asyncObjectsList.backupLocalVariablesContainers(gdjs.MenuCode.localVariables);
runtimeScene.getAsyncTasksManager().addTask(gdjs.evtTools.runtimeScene.wait(1), (runtimeScene) => (gdjs.MenuCode.asyncCallback12616284(runtimeScene, asyncObjectsList)), 12616284, asyncObjectsList);
}
}

}


};gdjs.MenuCode.eventsList7 = function(runtimeScene) {

{


let isConditionTrue_0 = false;
{
gdjs.copyArray(runtimeScene.getObjects("Ground"), gdjs.MenuCode.GDGroundObjects1);
{for(var i = 0, len = gdjs.MenuCode.GDGroundObjects1.length ;i < len;++i) {
    gdjs.MenuCode.GDGroundObjects1[i].setXOffset(gdjs.MenuCode.GDGroundObjects1[i].getXOffset() + (100 * gdjs.evtTools.runtimeScene.getElapsedTimeInSeconds(runtimeScene)));
}
}
}

}


};gdjs.MenuCode.mapOfGDgdjs_9546MenuCode_9546GDcopryObjects2Objects = Hashtable.newFrom({"copry": gdjs.MenuCode.GDcopryObjects2});
gdjs.MenuCode.eventsList8 = function(runtimeScene) {

{


let isConditionTrue_0 = false;
isConditionTrue_0 = false;
{isConditionTrue_0 = runtimeScene.getOnceTriggers().triggerOnce(12618860);
}
if (isConditionTrue_0) {
gdjs.copyArray(runtimeScene.getObjects("AuthorLink"), gdjs.MenuCode.GDAuthorLinkObjects3);
{for(var i = 0, len = gdjs.MenuCode.GDAuthorLinkObjects3.length ;i < len;++i) {
    gdjs.MenuCode.GDAuthorLinkObjects3[i].setOutline("0;0;255", 3);
}
}
}

}


{


let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.isMouseButtonReleased(runtimeScene, "Left");
if (isConditionTrue_0) {
{gdjs.evtTools.window.openURL("https://www.youtube.com/@user-nikunekokikaku/videos", runtimeScene);
}
}

}


};gdjs.MenuCode.mapOfGDgdjs_9546MenuCode_9546GDcopryObjects1Objects = Hashtable.newFrom({"copry": gdjs.MenuCode.GDcopryObjects1});
gdjs.MenuCode.eventsList9 = function(runtimeScene) {

{

gdjs.copyArray(runtimeScene.getObjects("copry"), gdjs.MenuCode.GDcopryObjects2);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.cursorOnObject(gdjs.MenuCode.mapOfGDgdjs_9546MenuCode_9546GDcopryObjects2Objects, runtimeScene, true, false);
if (isConditionTrue_0) {

{ //Subevents
gdjs.MenuCode.eventsList8(runtimeScene);} //End of subevents
}

}


{

gdjs.copyArray(runtimeScene.getObjects("copry"), gdjs.MenuCode.GDcopryObjects1);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.input.cursorOnObject(gdjs.MenuCode.mapOfGDgdjs_9546MenuCode_9546GDcopryObjects1Objects, runtimeScene, true, true);
if (isConditionTrue_0) {
isConditionTrue_0 = false;
{isConditionTrue_0 = runtimeScene.getOnceTriggers().triggerOnce(12619732);
}
}
if (isConditionTrue_0) {
gdjs.copyArray(runtimeScene.getObjects("AuthorLink"), gdjs.MenuCode.GDAuthorLinkObjects1);
{for(var i = 0, len = gdjs.MenuCode.GDAuthorLinkObjects1.length ;i < len;++i) {
    gdjs.MenuCode.GDAuthorLinkObjects1[i].setOutline("0;0;255", 0);
}
}
}

}


};gdjs.MenuCode.eventsList10 = function(runtimeScene) {

{


let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.runtimeScene.sceneJustBegins(runtimeScene);
if (isConditionTrue_0) {
isConditionTrue_0 = false;
{isConditionTrue_0 = runtimeScene.getOnceTriggers().triggerOnce(12601348);
}
}
if (isConditionTrue_0) {
gdjs.copyArray(runtimeScene.getObjects("Background"), gdjs.MenuCode.GDBackgroundObjects1);
{gdjs.evtTools.sound.playSoundOnChannel(runtimeScene, "のどかな草原_-_8bit.mp3", 1, true, 40, 1);
}
{for(var i = 0, len = gdjs.MenuCode.GDBackgroundObjects1.length ;i < len;++i) {
    gdjs.MenuCode.GDBackgroundObjects1[i].setColor("7;108;204");
}
}
}

}


{


gdjs.MenuCode.eventsList1(runtimeScene);
}


{


let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.runtimeScene.sceneJustBegins(runtimeScene);
if (isConditionTrue_0) {
isConditionTrue_0 = false;
{isConditionTrue_0 = runtimeScene.getOnceTriggers().triggerOnce(12607820);
}
}
if (isConditionTrue_0) {
{gdjs.evtTools.storage.readNumberFromJSONFile("save1", "save1", runtimeScene, runtimeScene.getScene().getVariables().getFromIndex(1));
}
}

}


{


let isConditionTrue_0 = false;
{
{gdjs.evtTools.storage.writeNumberInJSONFile("save1", "save1", gdjs.evtTools.variable.getVariableNumber(runtimeScene.getScene().getVariables().getFromIndex(1)));
}
}

}


{


let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.variable.getVariableNumber(runtimeScene.getScene().getVariables().getFromIndex(1)) == 0;
if (isConditionTrue_0) {
gdjs.copyArray(runtimeScene.getObjects("Skin"), gdjs.MenuCode.GDSkinObjects1);
{for(var i = 0, len = gdjs.MenuCode.GDSkinObjects1.length ;i < len;++i) {
    gdjs.MenuCode.GDSkinObjects1[i].deleteFromScene(runtimeScene);
}
}
}

}


{

gdjs.copyArray(runtimeScene.getObjects("Skin"), gdjs.MenuCode.GDSkinObjects1);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
for (var i = 0, k = 0, l = gdjs.MenuCode.GDSkinObjects1.length;i<l;++i) {
    if ( gdjs.MenuCode.GDSkinObjects1[i].IsClicked(null) ) {
        isConditionTrue_0 = true;
        gdjs.MenuCode.GDSkinObjects1[k] = gdjs.MenuCode.GDSkinObjects1[i];
        ++k;
    }
}
gdjs.MenuCode.GDSkinObjects1.length = k;
if (isConditionTrue_0) {
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.variable.getVariableNumber(runtimeScene.getGame().getVariables().getFromIndex(0)) == 0;
}
if (isConditionTrue_0) {
{gdjs.evtTools.sound.playSoundOnChannel(runtimeScene, "決定ボタンを押す35.mp3", 2, false, 80, 0.9);
}

{ //Subevents
gdjs.MenuCode.eventsList2(runtimeScene);} //End of subevents
}

}


{

gdjs.copyArray(runtimeScene.getObjects("Skin"), gdjs.MenuCode.GDSkinObjects1);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
for (var i = 0, k = 0, l = gdjs.MenuCode.GDSkinObjects1.length;i<l;++i) {
    if ( gdjs.MenuCode.GDSkinObjects1[i].IsClicked(null) ) {
        isConditionTrue_0 = true;
        gdjs.MenuCode.GDSkinObjects1[k] = gdjs.MenuCode.GDSkinObjects1[i];
        ++k;
    }
}
gdjs.MenuCode.GDSkinObjects1.length = k;
if (isConditionTrue_0) {
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.variable.getVariableNumber(runtimeScene.getGame().getVariables().getFromIndex(0)) == 1;
}
if (isConditionTrue_0) {
{gdjs.evtTools.sound.playSoundOnChannel(runtimeScene, "決定ボタンを押す35.mp3", 2, false, 80, 0.9);
}

{ //Subevents
gdjs.MenuCode.eventsList3(runtimeScene);} //End of subevents
}

}


{

gdjs.copyArray(runtimeScene.getObjects("Skin"), gdjs.MenuCode.GDSkinObjects1);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
for (var i = 0, k = 0, l = gdjs.MenuCode.GDSkinObjects1.length;i<l;++i) {
    if ( gdjs.MenuCode.GDSkinObjects1[i].IsClicked(null) ) {
        isConditionTrue_0 = true;
        gdjs.MenuCode.GDSkinObjects1[k] = gdjs.MenuCode.GDSkinObjects1[i];
        ++k;
    }
}
gdjs.MenuCode.GDSkinObjects1.length = k;
if (isConditionTrue_0) {
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.variable.getVariableNumber(runtimeScene.getGame().getVariables().getFromIndex(0)) == 2;
}
if (isConditionTrue_0) {
{gdjs.evtTools.sound.playSoundOnChannel(runtimeScene, "決定ボタンを押す35.mp3", 2, false, 80, 0.9);
}

{ //Subevents
gdjs.MenuCode.eventsList4(runtimeScene);} //End of subevents
}

}


{

gdjs.copyArray(runtimeScene.getObjects("Skin"), gdjs.MenuCode.GDSkinObjects1);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
for (var i = 0, k = 0, l = gdjs.MenuCode.GDSkinObjects1.length;i<l;++i) {
    if ( gdjs.MenuCode.GDSkinObjects1[i].IsClicked(null) ) {
        isConditionTrue_0 = true;
        gdjs.MenuCode.GDSkinObjects1[k] = gdjs.MenuCode.GDSkinObjects1[i];
        ++k;
    }
}
gdjs.MenuCode.GDSkinObjects1.length = k;
if (isConditionTrue_0) {
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.variable.getVariableNumber(runtimeScene.getGame().getVariables().getFromIndex(0)) == 3;
}
if (isConditionTrue_0) {
{gdjs.evtTools.sound.playSoundOnChannel(runtimeScene, "決定ボタンを押す35.mp3", 2, false, 80, 0.9);
}

{ //Subevents
gdjs.MenuCode.eventsList5(runtimeScene);} //End of subevents
}

}


{

gdjs.copyArray(runtimeScene.getObjects("Skin"), gdjs.MenuCode.GDSkinObjects1);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
for (var i = 0, k = 0, l = gdjs.MenuCode.GDSkinObjects1.length;i<l;++i) {
    if ( gdjs.MenuCode.GDSkinObjects1[i].IsClicked(null) ) {
        isConditionTrue_0 = true;
        gdjs.MenuCode.GDSkinObjects1[k] = gdjs.MenuCode.GDSkinObjects1[i];
        ++k;
    }
}
gdjs.MenuCode.GDSkinObjects1.length = k;
if (isConditionTrue_0) {
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.variable.getVariableNumber(runtimeScene.getGame().getVariables().getFromIndex(0)) == 4;
}
if (isConditionTrue_0) {
{gdjs.evtTools.sound.playSoundOnChannel(runtimeScene, "決定ボタンを押す35.mp3", 2, false, 80, 0.9);
}

{ //Subevents
gdjs.MenuCode.eventsList6(runtimeScene);} //End of subevents
}

}


{


gdjs.MenuCode.eventsList7(runtimeScene);
}


{


gdjs.MenuCode.eventsList9(runtimeScene);
}


};

gdjs.MenuCode.func = function(runtimeScene) {
runtimeScene.getOnceTriggers().startNewFrame();

gdjs.MenuCode.GDTitleObjects1.length = 0;
gdjs.MenuCode.GDTitleObjects2.length = 0;
gdjs.MenuCode.GDTitleObjects3.length = 0;
gdjs.MenuCode.GDTitleObjects4.length = 0;
gdjs.MenuCode.GDPlaneObjects1.length = 0;
gdjs.MenuCode.GDPlaneObjects2.length = 0;
gdjs.MenuCode.GDPlaneObjects3.length = 0;
gdjs.MenuCode.GDPlaneObjects4.length = 0;
gdjs.MenuCode.GDBlackRectangleObjects1.length = 0;
gdjs.MenuCode.GDBlackRectangleObjects2.length = 0;
gdjs.MenuCode.GDBlackRectangleObjects3.length = 0;
gdjs.MenuCode.GDBlackRectangleObjects4.length = 0;
gdjs.MenuCode.GDGroundObjects1.length = 0;
gdjs.MenuCode.GDGroundObjects2.length = 0;
gdjs.MenuCode.GDGroundObjects3.length = 0;
gdjs.MenuCode.GDGroundObjects4.length = 0;
gdjs.MenuCode.GDBackgroundObjects1.length = 0;
gdjs.MenuCode.GDBackgroundObjects2.length = 0;
gdjs.MenuCode.GDBackgroundObjects3.length = 0;
gdjs.MenuCode.GDBackgroundObjects4.length = 0;
gdjs.MenuCode.GDAuthorLinkObjects1.length = 0;
gdjs.MenuCode.GDAuthorLinkObjects2.length = 0;
gdjs.MenuCode.GDAuthorLinkObjects3.length = 0;
gdjs.MenuCode.GDAuthorLinkObjects4.length = 0;
gdjs.MenuCode.GDStartObjects1.length = 0;
gdjs.MenuCode.GDStartObjects2.length = 0;
gdjs.MenuCode.GDStartObjects3.length = 0;
gdjs.MenuCode.GDStartObjects4.length = 0;
gdjs.MenuCode.GDTitletestObjects1.length = 0;
gdjs.MenuCode.GDTitletestObjects2.length = 0;
gdjs.MenuCode.GDTitletestObjects3.length = 0;
gdjs.MenuCode.GDTitletestObjects4.length = 0;
gdjs.MenuCode.GDcopryObjects1.length = 0;
gdjs.MenuCode.GDcopryObjects2.length = 0;
gdjs.MenuCode.GDcopryObjects3.length = 0;
gdjs.MenuCode.GDcopryObjects4.length = 0;
gdjs.MenuCode.GDHigescoreObjects1.length = 0;
gdjs.MenuCode.GDHigescoreObjects2.length = 0;
gdjs.MenuCode.GDHigescoreObjects3.length = 0;
gdjs.MenuCode.GDHigescoreObjects4.length = 0;
gdjs.MenuCode.GDSkinObjects1.length = 0;
gdjs.MenuCode.GDSkinObjects2.length = 0;
gdjs.MenuCode.GDSkinObjects3.length = 0;
gdjs.MenuCode.GDSkinObjects4.length = 0;

gdjs.MenuCode.eventsList10(runtimeScene);
gdjs.MenuCode.GDTitleObjects1.length = 0;
gdjs.MenuCode.GDTitleObjects2.length = 0;
gdjs.MenuCode.GDTitleObjects3.length = 0;
gdjs.MenuCode.GDTitleObjects4.length = 0;
gdjs.MenuCode.GDPlaneObjects1.length = 0;
gdjs.MenuCode.GDPlaneObjects2.length = 0;
gdjs.MenuCode.GDPlaneObjects3.length = 0;
gdjs.MenuCode.GDPlaneObjects4.length = 0;
gdjs.MenuCode.GDBlackRectangleObjects1.length = 0;
gdjs.MenuCode.GDBlackRectangleObjects2.length = 0;
gdjs.MenuCode.GDBlackRectangleObjects3.length = 0;
gdjs.MenuCode.GDBlackRectangleObjects4.length = 0;
gdjs.MenuCode.GDGroundObjects1.length = 0;
gdjs.MenuCode.GDGroundObjects2.length = 0;
gdjs.MenuCode.GDGroundObjects3.length = 0;
gdjs.MenuCode.GDGroundObjects4.length = 0;
gdjs.MenuCode.GDBackgroundObjects1.length = 0;
gdjs.MenuCode.GDBackgroundObjects2.length = 0;
gdjs.MenuCode.GDBackgroundObjects3.length = 0;
gdjs.MenuCode.GDBackgroundObjects4.length = 0;
gdjs.MenuCode.GDAuthorLinkObjects1.length = 0;
gdjs.MenuCode.GDAuthorLinkObjects2.length = 0;
gdjs.MenuCode.GDAuthorLinkObjects3.length = 0;
gdjs.MenuCode.GDAuthorLinkObjects4.length = 0;
gdjs.MenuCode.GDStartObjects1.length = 0;
gdjs.MenuCode.GDStartObjects2.length = 0;
gdjs.MenuCode.GDStartObjects3.length = 0;
gdjs.MenuCode.GDStartObjects4.length = 0;
gdjs.MenuCode.GDTitletestObjects1.length = 0;
gdjs.MenuCode.GDTitletestObjects2.length = 0;
gdjs.MenuCode.GDTitletestObjects3.length = 0;
gdjs.MenuCode.GDTitletestObjects4.length = 0;
gdjs.MenuCode.GDcopryObjects1.length = 0;
gdjs.MenuCode.GDcopryObjects2.length = 0;
gdjs.MenuCode.GDcopryObjects3.length = 0;
gdjs.MenuCode.GDcopryObjects4.length = 0;
gdjs.MenuCode.GDHigescoreObjects1.length = 0;
gdjs.MenuCode.GDHigescoreObjects2.length = 0;
gdjs.MenuCode.GDHigescoreObjects3.length = 0;
gdjs.MenuCode.GDHigescoreObjects4.length = 0;
gdjs.MenuCode.GDSkinObjects1.length = 0;
gdjs.MenuCode.GDSkinObjects2.length = 0;
gdjs.MenuCode.GDSkinObjects3.length = 0;
gdjs.MenuCode.GDSkinObjects4.length = 0;


return;

}

gdjs['MenuCode'] = gdjs.MenuCode;
