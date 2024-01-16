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
*       - Public
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
*                 token: 
*                   type: string
*                   description: JWT token for authentication
*                 category: 
*                   type: string
*                   description: User category (host or admin)
*                 redirectLink:
*                   type: string
*                   description: Redirect link based on user category
*                 Host: 
*                   type: object
*                   description: Display all host is category is admin
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
 *  /showCurrentlyLogin:
 *    get:
 *      summary: Display user information from JWT token
 *      tags:
 *        - Public
 *      security:
 *        - Authorization: []
 *      responses:
 *        200:
 *          description: Successful retrieval of user information
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  username:
 *                    type: string
 *                  user_id:
 *                    type: string
 *                    format: uuid
 *              description: User information retrieved from JWT token
 *        401:
 *          description: Unauthorized - Invalid or missing token
 */

/**
 * @swagger
 *  /delete/visitors:
 *    post:
 *      summary: Delete a visitor
 *      description: Deletes a visitor based on the provided data.
 *      tags:
 *        - Public
 *      security:
 *        - Authorization: []
 *      requestBody:
 *        required: true
 *        content: 
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                name:
 *                  type: string
 *      responses:
 *        200:
 *          description: Success. Visitor deleted successfully.
 *          schema:
 *            type: object
 *            properties:
 *              status:
 *                type: integer
 *                example: 200
 *              data:
 *                type: string
 *                example: 'Visitor deleted successfully'
 *        403:
 *          description: Forbidden. Permission denied.
 *          schema:
 *            type: object
 *            properties:
 *              status:
 *                type: integer
 *                example: 403
 *              data:
 *                type: object
 *                properties:
 *                  error:
 *                    type: string
 *                    example: 'Permission denied'
 *        404:
 *          description: Not Found. Visitor not found.
 *          schema:
 *            type: object
 *            properties:
 *              status:
 *                type: integer
 *                example: 404
 *              data:
 *                type: object
 *                properties:
 *                  error:
 *                    type: string
 *                    example: 'Visitor not found'
 *        500:
 *          description: Internal Server Error. Failed to delete visitor.
 *          schema:
 *            type: object
 *            properties:
 *              status:
 *                type: integer
 *                example: 500
 *              data:
 *                type: object
 *                properties:
 *                  error:
 *                    type: string
 *                    example: 'Internal Server Error'
 */

/**
 * @swagger
 * /retrievePass/{visitor_id}:
 *    get:
 *      summary: Give the visitor pass
 *      security:
 *        - Authorization: []
 *      tags:
 *        - Public
 *      parameters:
 *          - in: path
 *            name: visitor_id
 *            description: visitor id
 *            required: true
 *            schema: 
 *              type: string
  *      responses:
 *        200:
 *          description: Successful retrieval of visitor pass information
 *          content:
 *            application/json:
 *              schema:
 *                   qrCodeUrl:
 *                   type: string
 *                   format: uri
 *                   description: URL to the generated QR code    
 *              description: Visitor information retrieved from visitor pass
 *        404:
 *          description: Visitor not found
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  error:
 *                    type: string
 *                    description: Visitor not yet registered
 *        500:
 *          description: Internal Server Error
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  error:
 *                    type: string
 *                    description: Internal Server Error
 *        401:
 *          description: Unauthorized - Invalid or missing token
 */

/**
 * @swagger
 * /retrieveContact/{visitor_id}:
 *    get:
 *      summary: Give the host phone number that help the visitor to register
 *      security:
 *        - Authorization: []
 *      tags:
 *        - Public
 *      parameters:
 *          - in: path
 *            name: visitor_id
 *            description: visitor id
 *            required: true
 *            schema: 
 *              type: string
 *      responses:
 *        200:
 *          description: Successful retrieval of host phone number through visitor pass 
 *          content:
 *            application/json:
 *              schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Phone number of the host
 *                   example: "Visitor Adam goitng to 1, Jalan OZ 6 has a host number of 234-3432034 and is registered by host: John Doe"
 *            
 *        401:
 *          description: Unauthorized - Invalid or missing token
 */


/**
* @swagger
* /admin/visitors:
*   get:
*     summary: Get all visits data 
*     description: Retrieve all visit data 
*     tags: 
*       - Admin
*     security:
*       - Authorization: []
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
 * /create/host:
 *   post:
 *     tags:
 *       - Public
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
 *                              type: string
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
 */

/**
 * @swagger
 * /create/test/host:
 *   post:
 *     tags:
 *       - Public
 *     summary: Register a new host
 *     description: Test route to register a new host in the system (admin access required).
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
 */


/**
 * @swagger
 * /admin/dumpHost:
 *   get:
 *     summary: Retrieve all host data for admin
 *     description: |
 *       Retrieves host data from the database for admin purposes.
 *       This endpoint is only accessible to admin users.
 *     tags:
 *       - Admin
 *     security:
 *       - Authorization: []
 *     responses:
 *       200:
 *         description: This endpoint is only accessible to admin users.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 Host:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 
 *       401:
 *         description: Unauthorized. Please login.
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Unauthorized. Please login.
 *       403:
 *         description: Forbidden - User does not have admin rights
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Forbidden - User does not have admin rights
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *              status: 500
 *              error: 'Internal Server Error'
 */

/**
 * @swagger
 * /admin/editHost/{id}:
 *   patch:
 *     summary: Edit host information (Admin)
 *     security:
 *       - Authorization: []
 *     tags:
 *       - Admin
 *     parameters:
 *       - in: path
 *         name: id
 *         description: Host ID
 *         required: true
 *         schema:
 *           type: string
 *       - in: header
 *         name: Authorization
 *         description: JWT token for authentication (Admin)
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Updated host data
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *     responses:
 *       200:
 *         description: Host data updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: string
 *                   description: Success message
 *                   example: Update host data successfully
 *       404:
 *         description: Host not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *                   example: Host not found
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
 * /admin/editHostPass/{id}:
 *   patch:
 *     summary: Edit host password (Admin)
 *     security:
 *       - Authorization: []
 *     tags:
 *       - Admin
 *     parameters:
 *       - in: path
 *         name: id
 *         description: Host ID
 *         required: true
 *         schema:
 *           type: string
 *       - in: header
 *         name: Authorization
 *         description: JWT token for authentication (Admin)
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Object containing old and new passwords
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldpassword:
 *                 type: string
 *               newpassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Host password updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: string
 *                   description: Success message
 *                   example: Host password updated successfully
 *       400:
 *         description: Weak password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *                   example: Weak password
 *                 reasons:
 *                   type: array
 *                   description: Array of reasons why the password is weak
 *                   items:
 *                     type: string
 *       401:
 *         description: Invalid old password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *                   example: Invalid old password
 *       404:
 *         description: Host not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *                   example: Host not found
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
 * /admin/deleteHost/{id}:
 *   delete:
 *     summary: Delete host by ID (Admin)
 *     security:
 *       - Authorization: []
 *     tags:
 *       - Admin
 *     parameters:
 *       - in: path
 *         name: id
 *         description: Host ID
 *         required: true
 *         schema:
 *           type: string
 *       - in: header
 *         name: Authorization
 *         description: JWT token for authentication (Admin)
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Host deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: string
 *                   description: Success message
 *                   example: Host deleted successfully
 *       404:
 *         description: Host not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *                   example: Host not found
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
 * /host/{hostId}/issueVisitor:
 *   post:
 *     security:
 *       - Authorization: []
 *     summary: Issue a visitor pass by a host
 *     description: This endpoint allows hosts to issue a visitor to obtain a visitor pass.
 *     tags:
 *       - Host
 *     parameters:
 *       - in: path
 *         name: hostId
 *         description: ID of the host
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the visitor.
 *               phoneNumber:
 *                 type: string
 *                 format: number
 *                 description: Phone number of the visitor.
 *               destination:
 *                 type: string
 *                 description: 5, Jalan Oz 7
 *             required:
 *               - visitorName
 *               - visitorPhoneNumber
 *               - destination
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             example:
 *               status: 200
 *               data: 'Visitor issued successfully'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             example:
 *               status: 401
 *               error: |
 *                 Unauthorized: Missing or invalid token
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             example:
 *               status: 403
 *               error: |
 *                 Forbidden: Insufficient permissions
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *               status: 500
 *               error: 'Internal Server Error'
 */



/**
 * @swagger
 * components:
 *   schemas:
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
 *           type: string
 *           description: Phone number of the visitor
 *         destination:
 *           type: string
 *           description: Place the visitor want to visit
 *       example:
 *         name: John Doe
 *         phoneNumber: 1234567890
 *         destination: 34, Jalan Oz53
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
 *           type: string
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
 *               - destination: 5, Jalan Oz 8
 *                 phoneNumber: 1234567890
 *                 visitTime: '2023-01-01T12:00:00Z'
 * 
 *     HostRegistration:
 *       type: object
 *       properties:
 *         username:
 *           type: string
 *           description: Host's username
 *           example: john_doe
 *         password:
 *           type: string
 *           description: Host's password
 *           example: my_secure_password
 *         email:
 *           type: string
 *           description: Host's email
 *           example: john@example.com
 *         phoneNumber:
 *           type: string
 *           description: Host's phone number
 *           example: 1234567890
 */

