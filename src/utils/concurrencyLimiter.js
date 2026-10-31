let activeUploadCount = 0;

function getCurrentUploadCount() {
  return activeUploadCount;
}

function acquireUploadSlot(maxConcurrent) {
  if (activeUploadCount >= maxConcurrent) {
    return { acquired: false };
  }
  activeUploadCount += 1;
  return { acquired: true, slotId: Symbol("uploadSlot") };
}

function releaseUploadSlot() {
  if (activeUploadCount > 0) {
    activeUploadCount -= 1;
  }
}

module.exports = {
  getCurrentUploadCount,
  acquireUploadSlot,
  releaseUploadSlot,
};
