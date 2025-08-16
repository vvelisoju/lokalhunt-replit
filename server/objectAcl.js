const ACL_POLICY_METADATA_KEY = "custom:aclPolicy";

// The type of the access group.
const ObjectAccessGroupType = {};

const ObjectPermission = {
  READ: "read",
  WRITE: "write",
};

// Check if the requested permission is allowed based on the granted permission.
function isPermissionAllowed(requested, granted) {
  // Users granted with read or write permissions can read the object.
  if (requested === ObjectPermission.READ) {
    return [ObjectPermission.READ, ObjectPermission.WRITE].includes(granted);
  }

  // Only users granted with write permissions can write the object.
  return granted === ObjectPermission.WRITE;
}

// The base class for all access groups.
class BaseObjectAccessGroup {
  constructor(type, id) {
    this.type = type;
    this.id = id;
  }

  // Check if the user is a member of the group.
  async hasMember(userId) {
    // Override in subclasses
    return false;
  }
}

function createObjectAccessGroup(group) {
  switch (group.type) {
    default:
      throw new Error(`Unknown access group type: ${group.type}`);
  }
}

// Sets the ACL policy to the object metadata.
async function setObjectAclPolicy(objectFile, aclPolicy) {
  const [exists] = await objectFile.exists();
  if (!exists) {
    throw new Error(`Object not found: ${objectFile.name}`);
  }

  await objectFile.setMetadata({
    metadata: {
      [ACL_POLICY_METADATA_KEY]: JSON.stringify(aclPolicy),
    },
  });
}

// Gets the ACL policy from the object metadata.
async function getObjectAclPolicy(objectFile) {
  const [metadata] = await objectFile.getMetadata();
  const aclPolicy = metadata?.metadata?.[ACL_POLICY_METADATA_KEY];
  if (!aclPolicy) {
    return null;
  }
  return JSON.parse(aclPolicy);
}

// Checks if the user can access the object.
async function canAccessObject({
  userId,
  objectFile,
  requestedPermission,
}) {
  // When this function is called, the acl policy is required.
  const aclPolicy = await getObjectAclPolicy(objectFile);
  if (!aclPolicy) {
    return false;
  }

  // Public objects are always accessible for read.
  if (
    aclPolicy.visibility === "public" &&
    requestedPermission === ObjectPermission.READ
  ) {
    return true;
  }

  // Access control requires the user id.
  if (!userId) {
    return false;
  }

  // The owner of the object can always access it.
  if (aclPolicy.owner === userId) {
    return true;
  }

  // Go through the ACL rules to check if the user has the required permission.
  for (const rule of aclPolicy.aclRules || []) {
    const accessGroup = createObjectAccessGroup(rule.group);
    if (
      (await accessGroup.hasMember(userId)) &&
      isPermissionAllowed(requestedPermission, rule.permission)
    ) {
      return true;
    }
  }

  return false;
}

module.exports = {
  ObjectAccessGroupType,
  ObjectPermission,
  setObjectAclPolicy,
  getObjectAclPolicy,
  canAccessObject
};