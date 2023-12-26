/**
 * @swagger
 * /:
 *  get:
 *      summary: This api is for testing
 *      description: This api is used for testing
 *      tags:
 *        - Test
 *      responses:
 *          200:
 *              description: to test get api
 */

/**
* @swagger
* /login:
*   post:
*     summary: Login for admin or host
*     description: Authenticate a user and generate a JWT token
*     tags: 
*       - Login
*     requestBody:
*       required: true
*       content: 
*         application/json:
*           schema:
*             type: object
*             properties:
*               username:
*                 type: string
*               password:
*                 type: string
*     responses:
*       200:   
*         description: Successful login
*         content:
*           application/json:
*             schema: 
*               type: object    
*               properties:
*                 username: 
*                   type: string
*                   description: Username
*                 message:
*                   type: string
*                   description: Success message
*                 token: 
*                   type: string
*                   description: JWT token for authentication
*                 category: 
*                   type: string
*                   description: User category (host or admin)
*                 redirectLink:
*                   type: string
*                   description: Redirect link based on user category
*       401:
*         description: Unauthorized - Wrong password
*         content:
*           text/plain:
*             schema:
*               type: string
*               example: Unauthorized Wrong password
*       404:
*         description: Username not found
*         content:
*           text/plain:
*             schema:
*               type: string
*               example: Username not found
*       409:
*         description: User is already logged in
*         content:
*           text/plain:
*             schema:
*               type: string
*               example: User is already logged in
*       500: 
*         description: Internal Server Error
*         content:
*           application/json:
*             schema: 
*               type: object
*               properties: 
*                 error:
*                   type: string
*                   description: Error message
*                   example: Internal Server Error
*/

/**
* @swagger
* /admin/visits:
*   get:
*     summary: Get all visits data 
*     description: Retrieve all visit data 
*     tags: 
*       - Admin
*     responses:
*       200:
*         description: Successful operation
*         content:
*           application/json:
*             schema:
*               type: array
*               items:
*                 $ref: '#/components/schemas/Visit'
*       401:
*         description: Unauthorized - Invalid or missing token
*       403:
*         description: Forbidden - Insufficient permissions
*       500:
*         description: Internal Server Error
*/



/**
 * @swagger
 * /admin/registerHost:
 *   post:
 *     tags:
 *       - Admin
 *     summary: Register a new host
 *     description: Register a new host in the system (admin access required).
 *     security:
 *       - Authorization: []
 *     requestBody:
 *          required: true
 *          content: 
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          username:
 *                              type: string
 *                          password:
 *                              type: string
 *                          email:
 *                              type: string
 *                          phoneNumber:
 *                              type: Number
 *                      required:
 *                          - username
 *                          - password
 *                          - email
 *                          - phoneNumber
 *     responses:
 *       201:
 *         description: Host registered successfully
 *       400:
 *         description: Bad Request - Invalid request payload
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       500:
 *         description: Internal Server Error
 * 
 * definitions:
 *   HostRegistration:
 *     type: object
 *     properties:
 *       username:
 *         type: string
 *         description: Host's username
 *         example: john_doe
 *       password:
 *         type: string
 *         description: Host's password
 *         example: my_secure_password
 *       email:
 *         type: string
 *         description: Host's email
 *         example: john@example.com
 *       phoneNumber:
 *         type: number
 *         description: Host's phone number
 *         example: 1234567890
 */


/**
 * @swagger
 * /host/{hostId}:
 *   get:
 *     security:
 *       - Authorization: []
 *     summary: Get welcome message for a host
 *     description: Retrieve a welcome message for a specific host
 *     tags: [Host]
 *     parameters:
 *       - in: path
 *         name: hostId
 *         description: ID of the host
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Welcome message
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       500:
 *         description: Internal Server Error
 * 
 * /host/{hostId}/visitors:
 *   get:
 *     security:
 *       - Authorization: []
 *     summary: Get visitors for a host
 *     description: Retrieve visitors registered under a specific host
 *     tags: [Host]
 *     parameters:
 *       - in: path
 *         name: hostId
 *         description: ID of the host
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Visitor'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Visit:
 *       type: object
 *       required:
 *         - purposeOfVisit
 *         - phoneNumber
 *       properties:
 *         purposeOfVisit:
 *           type: string
 *           description: The purpose of the visit
 *         visitTime:
 *           type: string
 *           format: date-time
 *           description: The time of the visit
 *       example:
 *         purposeOfVisit: Meeting
 *
 *     Visitor:
 *       type: object
 *       required:
 *         - name
 *         - phoneNumber
 *       properties:
 *         name:
 *           type: string
 *           description: The name of the visitor
 *         phoneNumber:
 *           type: number
 *           description: Phone number of the visitor
 *         visits:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Visit'
 *       example:
 *         name: John Doe
 *         phoneNumber: 1234567890
 *         visits:
 *           - purposeOfVisit: Meeting
 *             visitTime: '2023-01-01T12:00:00Z'
 *
 *     User:
 *       type: object
 *       required:
 *         - username
 *         - password
 *         - email
 *         - phoneNumber
 *         - category
 *       properties:
 *         username:
 *           type: string
 *           description: The username of the user
 *         password:
 *           type: string
 *           description: The password of the user
 *         email:
 *           type: string
 *           format: email
 *           description: The email address of the user
 *         phoneNumber:
 *           type: number
 *           description: The phone number of the user
 *         category:
 *           type: string
 *           enum:
 *             - host
 *             - admin
 *           description: The category of the user (host or admin)
 *         visitors:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Visitor'
 *       example:
 *         username: user123
 *         password: password123
 *         email: user@exa\mple.com
 *         phoneNumber: 1234567890
 *         category: host
 *         visitors:
 *           - name: John Doe
 *             visits:
 *               - purposeOfVisit: Meeting
 *                 phoneNumber: 1234567890
 *                 visitTime: '2023-01-01T12:00:00Z'
 */

