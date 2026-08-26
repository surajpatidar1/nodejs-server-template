import { storageService } from './storage.service.js';
import { localStorageProvider } from './providers/local.provider.js';

const test = async (): Promise<void> => {
  const file = {
    buffer: Buffer.from('Storage service test file', 'utf-8'),
    originalName: 'storage-test.txt',
    mimeType: 'text/plain',
    size: Buffer.byteLength('Storage service test file'),
  };

  console.log(`Testing storage provider: ${process.env.STORAGE_PROVIDER}`);

  const result = await storageService.upload(file);

  console.log('Upload successful:');
  console.log(result);

  if (!result.key.startsWith('tmp/')) {
    throw new Error(
      `Expected upload key to start with "tmp/", got: ${result.key}`,
    );
  }

  console.log('Upload key has correct tmp/ prefix ✓');

  const url = await storageService.getUrl(result.key);

  console.log('URL:');
  console.log(url);

  await storageService.delete(result.key);

  console.log('Delete successful');
};

const testLocalMove = async (): Promise<void> => {
  if (
    process.env.STORAGE_PROVIDER &&
    process.env.STORAGE_PROVIDER !== 'local'
  ) {
    console.log(
      `Skipping local move() tests (provider is ${process.env.STORAGE_PROVIDER})`,
    );
    return;
  }

  console.log('\nTesting local provider move()...');

  // --- 1. Happy path: upload → tmp/ key → move to permanent folder ----------
  const file = {
    buffer: Buffer.from('move test content', 'utf-8'),
    originalName: 'move-test.txt',
    mimeType: 'text/plain',
    size: Buffer.byteLength('move test content'),
  };

  const uploaded = await localStorageProvider.upload(file);

  if (!uploaded.key.startsWith('tmp/')) {
    throw new Error(
      `Expected upload key to start with "tmp/", got: ${uploaded.key}`,
    );
  }

  const movedKey = await localStorageProvider.move(uploaded.key, 'test-folder');

  if (!movedKey.startsWith('test-folder/')) {
    throw new Error(
      `Expected moved key to start with "test-folder/", got: ${movedKey}`,
    );
  }

  if (movedKey.includes('tmp/')) {
    throw new Error(`Moved key must not contain "tmp/", got: ${movedKey}`);
  }

  console.log('move() happy path ✓', movedKey);

  // Clean up the moved file
  await localStorageProvider.delete(movedKey);

  // --- 2. Rejection: bare key (no tmp/ prefix) ------------------------------
  let threwOnBareKey = false;

  try {
    await localStorageProvider.move('somefile.txt', 'test-folder');
  } catch (err) {
    threwOnBareKey = true;

    const message = (err as Error).message ?? '';

    if (!message.includes('temporary upload')) {
      throw new Error(`Expected BadRequestException message, got: ${message}`);
    }
  }

  if (!threwOnBareKey) {
    throw new Error('Expected move() to throw for bare key, but it did not');
  }

  console.log('move() bare-key rejection ✓');

  // --- 3. Rejection: path-traversal key ------------------------------------
  let threwOnTraversal = false;

  try {
    await localStorageProvider.move('tmp/../../.env', 'test-folder');
  } catch (err) {
    threwOnTraversal = true;
    // resolvePath() throws 'Invalid storage key' for out-of-root paths;
    // BadRequestException fires first if the traversal doesn't start with tmp/
    const message = (err as Error).message ?? '';

    if (
      !message.includes('temporary upload') &&
      !message.includes('Invalid storage key')
    ) {
      throw new Error(`Expected containment error, got: ${message}`);
    }
  }

  if (!threwOnTraversal) {
    throw new Error(
      'Expected move() to throw for path-traversal key, but it did not',
    );
  }

  console.log('move() path-traversal rejection ✓');
};

test()
  .then(() => testLocalMove())
  .catch((error) => {
    console.error('Storage test failed:', error);
    process.exit(1);
  });
